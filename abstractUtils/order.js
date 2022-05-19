'use strict'

var logger = require('winston')
var _ = require('lodash')
var jsonpath = require('jsonpath')

/*
 * Purpose: To read line level discount(s) and add corresponding line item(s)
 *         2. reads line item node in order data, reads discount key in line item data from connector.
 *         3. if discount is an object, it further reads amount key in discount object.
 *         4. for every discount, it add a discount line item below the line item.
 */
exports.addDiscountLineItems = function (options) {
  var discountItem = options.discountLineSettingValue
  var productLineItems
  var productLineKey
  var discountKey
  var discountLineItem
  var discountedLinesCount = 0
  var lineItem
  var discountAmount
  var discountAmountkey
  var discountObj
  var index
  var discountLine
  var discountIndex
  var preMapData = options.preMapData
  var priceExtractKey = options.priceExtractKey
  var otherPriceExtractKey = options.otherPriceExtractKey
  var skuExtractKey = options.skuExtractKey

  logger.debug('entering addDiscountLineItems')

  if (discountItem) {
    productLineKey = options.productLineItemKey
    discountKey = options.discountKeyRespectToLineItem
    if (!priceExtractKey || !options.quantityExtractKey || !skuExtractKey) {
      return {
        error: {
          code: 'discount_error',
          message: 'Please provide required meta data (priceExtractKey/quantityExtractKey/skuExtractKey).'
        }
      }
    }
    // create the discount line item
    discountLineItem = {}
    if (otherPriceExtractKey) discountLineItem[otherPriceExtractKey] = '00.00'
    discountLineItem[options.quantityExtractKey] = '1.0'
    // validate nodes provided by connector
    try {
      productLineItems = eval('preMapData' + productLineKey)
    } catch (e) {
      logger.info('exception while reading line item', e.message)
      return {
        error: {
          code: 'discount_error',
          message: 'Could not read product line items from the order data.'
        }
      }
    }

    if (!_.isArray(productLineItems)) {
      // case of one line item and system gives it as an object
      productLineItems = [productLineItems]
    }

    var skuSourceKey
    var i
    var skuValue
    var discountLineItemCopy
    if (priceExtractKey.indexOf('.') > 0) {
      discountLineItem[options.priceKey] = JSON.parse(JSON.stringify(productLineItems[0][options.priceKey]))
      jsonpath.apply(discountLineItem, priceExtractKey, function () { return '00.00' })
    } else {
      discountLineItem[priceExtractKey] = '00.00'
    }

    var skuExtractKeys = []
    // Adding first line sku as discount line sku, will be overriden in postmap
    if (skuExtractKey.indexOf('.') > 0) { // eg: skuExtractKey= 'item_variation_data.sku'
      if (options.skuKey) { // copies whole object, eg: skuKey = 'item_variation_data
        discountLineItem[options.skuKey] = JSON.parse(JSON.stringify(productLineItems[0][options.skuKey]))
      } else { // copies only sku field
        skuValue = jsonpath.query(productLineItems[0], '$.' + options.skuExtractKey)
        skuExtractKeys = skuExtractKey.split('.')
        skuSourceKey = discountLineItem
        for (i = 0; i < skuExtractKeys.length; i++) {
          skuSourceKey = skuSourceKey[skuExtractKeys[i]] = {}
        }

        if (skuValue.length === 1) {
          jsonpath.apply(discountLineItem, skuExtractKey, function () { return skuValue[0] })
        }
      }
    } else {
      discountLineItem[skuExtractKey] = productLineItems[0] && productLineItems[0][skuExtractKey]
    }

    for (index = 0; index < productLineItems.length; index++) {
      lineItem = productLineItems[index]
      discountAmount = 0

      // adding tax total and tax lines
      if (options.taxExtractKey || options.taxLinesExtractKey) {
        if (options.taxExtractKey) {
          discountLineItem[options.taxExtractKey] = productLineItems[index] && productLineItems[index][options.taxExtractKey]
          if (options.taxKey) discountLineItem[options.taxKey] = productLineItems[index] && productLineItems[index][options.taxExtractKey]
        }
        if (options.taxLinesExtractKey) {
          discountLineItem[options.taxLinesExtractKey] = productLineItems[index] && productLineItems[index][options.taxLinesExtractKey]
        }
      }

      // add additionalKeys
      if (options.additionalKeys && !_.isEmpty(options.additionalKeys)) {
        _.each(options.additionalKeys, function (additionalKey) {
          discountLineItem[additionalKey] = productLineItems[index] && productLineItems[index][additionalKey]
        })
      }

      if (discountLineItem.hasOwnProperty(options.taxExtractKey) || discountLineItem.hasOwnProperty(options.taxLinesExtractKey)) {
        if (options.lineIdKey) {
          discountLineItem.celigo_line_item_type_id = 'Celigo_Discount_Line_' + (productLineItems[index] && productLineItems[index][options.lineIdKey])
        } else if (skuExtractKey.indexOf('.') > 0) {
          skuValue = jsonpath.query(productLineItems[index], '$.' + options.skuExtractKey)
          discountLineItem.celigo_line_item_type_id = 'Celigo_Discount_Line' + (!_.isEmpty(skuValue) ? '_' + skuValue[0] : '')
        } else {
          discountLineItem.celigo_line_item_type_id = 'Celigo_Discount_Line_' + (productLineItems[index] && productLineItems[index][skuExtractKey])
        }
      }

      try {
        discountObj = eval('lineItem' + discountKey)
      } catch (e) {
        logger.info('exception while reading discount', e.message)
        return {
          error: {
            code: 'discount_error',
            message: 'Could not read discount from product line item.'
          }
        }
      }
      if (discountObj) {
        if (_.isObject(discountObj)) {
          // in some connectors discount is an object.
          if (!_.isArray(discountObj)) {
            discountObj = [discountObj]
          }
          discountedLinesCount = 0
          discountAmountkey = options.discountAmountKeyRespectToDiscountObject
          for (discountIndex = 0; discountIndex < discountObj.length; discountIndex++) {
            discountLine = discountObj[discountIndex]
            try {
              discountAmount = eval('discountLine' + discountAmountkey)
            } catch (e) {
              logger.info('exception while reading discount amount', e.message)
              return {
                error: {
                  code: 'discount_error',
                  message: 'Could not read discount amount from discount object.'
                }
              }
            }
            if (priceExtractKey.indexOf('.') > 0) {
              discountAmount = -(Math.abs(parseFloat(discountAmount)))
              discountLineItemCopy = JSON.parse(JSON.stringify(discountLineItem))
              jsonpath.apply(discountLineItemCopy, priceExtractKey, function () {
                return discountAmount
              })

              if (otherPriceExtractKey) {
                jsonpath.apply(discountLineItemCopy, otherPriceExtractKey, function () {
                  return discountAmount
                })
              }

              // add discount line just after the line item
              if (!(discountAmount === 0 || discountAmount === -0)) {
                productLineItems.splice(index + discountedLinesCount + 1, 0, discountLineItemCopy)
                discountedLinesCount++
              }
            } else {
              discountLineItem[priceExtractKey] = (-(Math.abs(parseFloat(discountAmount))))
              if (otherPriceExtractKey) discountLineItem[otherPriceExtractKey] = (-(Math.abs(parseFloat(discountAmount))))
              // add discount line just after the line item
              if (!(discountLineItem[priceExtractKey] === 0 || discountLineItem[priceExtractKey] === -0)) {
                productLineItems.splice(index + discountedLinesCount + 1, 0, _.clone(discountLineItem))
                discountedLinesCount++
              }
            }
          }
        } else {
          // if discount is an amount field
          if (priceExtractKey.indexOf('.') > 0) {
            discountAmount = -(Math.abs(parseFloat(discountObj)))
            discountLineItemCopy = JSON.parse(JSON.stringify(discountLineItem))
            jsonpath.apply(discountLineItemCopy, priceExtractKey, function () {
              return discountAmount
            })

            if (otherPriceExtractKey) {
              jsonpath.apply(discountLineItemCopy, otherPriceExtractKey, function () {
                return discountAmount
              })
            }
            if (!(discountAmount === 0 || discountAmount === -0)) {
              productLineItems.splice(index + 1, 0, discountLineItemCopy)
            }
          } else {
            discountAmount = discountObj
            discountLineItem[priceExtractKey] = (-(Math.abs(parseFloat(discountAmount))))
            if (otherPriceExtractKey) discountLineItem[otherPriceExtractKey] = (-(Math.abs(parseFloat(discountAmount))))
            if (!(discountLineItem[priceExtractKey] === 0 || discountLineItem[priceExtractKey] === -0)) {
              productLineItems.splice(index + 1, 0, _.clone(discountLineItem))
            }
          }
        }
      }
    }
  }
}
