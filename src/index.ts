import dotenv from 'dotenv'
dotenv.config()

import { chromium } from 'playwright-chromium'
import fs from 'fs'
import path from 'path'

import { Constants } from './constants'
import { Hint } from 'types/map'

// Wait for inputs values change
const coordinateGenerator = (function* () {
  for(let x = Constants.MIN_COORDINATE_X; x <= Constants.MAX_COORDINATE_X; x++)
  for(let y = Constants.MIN_COORDINATE_Y; y <= Constants.MAX_COORDINATE_Y; y++)
  yield { x, y }
})()

const startBrowser = async (): Promise<boolean> => {
  console.log('Starting browser...')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(Constants.PAGE_URL)
  await page.waitForTimeout(Constants.PAGE_TIMEOUT)
  await page.locator('button', { hasText: Constants.COOKIE_BUTTON_TEXT }).click()

  // Change form language to Spanish
  await page.locator(Constants.SPANISH_BUTTON).click()

  // Coordinate inputs
  const inputX = page.locator(Constants.POSITION_X_INPUT)
  const inputY = page.locator(Constants.POSITION_Y_INPUT)

  // Direction buttons
  const directionButtons = [
    page.locator(Constants.TOP_BUTTON),
    page.locator(Constants.LEFT_BUTTON),
    page.locator(Constants.RIGHT_BUTTON),
    page.locator(Constants.BOTTOM_BUTTON)
  ]

  // Submit options
  const select = page.locator(Constants.HUNT_SELECT)
  const selectHints = page.locator(Constants.HUNT_SELECT_OPTIONS)
  const submitButton = page.locator(Constants.SUBMIT_BUTTON)

  // Results
  const resultMapCount = page.locator(Constants.RESULT_MAP_COUNT)

  async function getHintsValues(iterateCount: number): Promise<boolean | Function> {

    const newIterateCount = iterateCount + 1
    if(newIterateCount > 60) return false

    const coordinates = coordinateGenerator.next()
    if(coordinates.done) return true

    // Coordinates
    const { x, y } = coordinates.value
    const hints = await selectHints.elementHandles()
    const top: Hint[] = []
    const left: Hint[] = []
    const right: Hint[] = []
    const bottom: Hint[] = []

    // Interval loop conditions
    let isIntervalTopFinished = false
    let isIntervalLeftFinished = false
    let isIntervalRightFinished = false
    let isIntervalBottomFinished = false
    
    // Hint counters
    let topCurrentHint = 0
    let leftCurrentHint = 0
    let rightCurrentHint = 0
    let bottomCurrentHint = 0

    // Logs
    console.log(`current hint: [${x},${y}]`)

    // Top hints
    await inputX.fill(x.toString())
    await inputY.fill(y.toString())
    await directionButtons[0].click()
    const topHintsValues = await Promise.all(hints.map(async(hint) => await hint.isDisabled()))
    const topFilteredHints = hints.filter((hint, index) => !topHintsValues[index])
    if(!topFilteredHints.length) isIntervalTopFinished = true
    while(!isIntervalTopFinished) {
      const hintName = await topFilteredHints[topCurrentHint].innerText()
      await select.selectOption({ label: hintName })
      await submitButton.click()
      const mapCount = parseInt(await resultMapCount.innerText())
      if(!isNaN(mapCount)) top.push({ name: hintName, mapCount })
      topCurrentHint++
      if(topCurrentHint === topFilteredHints.length) isIntervalTopFinished = true
      await inputY.fill(y.toString())
      await directionButtons[0].click()
    }
    
    // Left hints
    await inputX.fill(x.toString())
    await inputY.fill(y.toString())
    await directionButtons[1].click()
    const leftHintsValues = await Promise.all(hints.map(async(hint) => await hint.isDisabled()))
    const leftFilteredHints = hints.filter((hint, index) => !leftHintsValues[index])
    if(!leftFilteredHints.length) isIntervalLeftFinished = true
    while(!isIntervalLeftFinished) {
      const hintName = await leftFilteredHints[leftCurrentHint].innerText()
      await select.selectOption({ label: hintName })
      await submitButton.click()
      const mapCount = parseInt(await resultMapCount.innerText())
      if(!isNaN(mapCount)) left.push({ name: hintName, mapCount })
      leftCurrentHint++
      if(leftCurrentHint === leftFilteredHints.length) isIntervalLeftFinished = true
      await inputX.fill(x.toString())
      await directionButtons[1].click()
    }

    // Right hints
    await inputX.fill(x.toString())
    await inputY.fill(y.toString())
    await directionButtons[2].click()
    const rightHintsValues = await Promise.all(hints.map(async(hint) => await hint.isDisabled()))
    const rightFilteredHints = hints.filter((hint, index) => !rightHintsValues[index])
    if(!rightFilteredHints.length) isIntervalRightFinished = true
    while(!isIntervalRightFinished) {
      const hintName = await rightFilteredHints[rightCurrentHint].innerText()
      await select.selectOption({ label: hintName })
      await submitButton.click()
      const mapCount = parseInt(await resultMapCount.innerText())
      if(!isNaN(mapCount)) right.push({ name: hintName, mapCount })
      rightCurrentHint++
      if(rightCurrentHint === rightFilteredHints.length) isIntervalRightFinished = true
      await inputX.fill(x.toString())
      await directionButtons[2].click()
    }

    // Bottom hints
    await inputX.fill(x.toString())
    await inputY.fill(y.toString())
    await directionButtons[3].click()
    const bottomHintsValues = await Promise.all(hints.map(async(hint) => await hint.isDisabled()))
    const bottomFilteredHints = hints.filter((hint, index) => !bottomHintsValues[index])
    if(!bottomFilteredHints.length) isIntervalBottomFinished = true
    while(!isIntervalBottomFinished) {
      const hintName = await bottomFilteredHints[bottomCurrentHint].innerText()
      await select.selectOption({ label: hintName })
      await submitButton.click()
      const mapCount = parseInt(await resultMapCount.innerText())
      if(!isNaN(mapCount)) bottom.push({ name: hintName, mapCount })
      bottomCurrentHint++
      if(bottomCurrentHint === bottomFilteredHints.length) isIntervalBottomFinished = true
      await inputY.fill(y.toString())
      await directionButtons[3].click()
    }

    // Ignore result if are not hints in all directions
    if(!top.length && !left.length && !right.length && !bottom.length) return await getHintsValues(newIterateCount)

    // Write hints to dofus map
    const coords = `[${x},${y}]`
    const result = JSON.stringify({ [coords]: { top, left, right, bottom } })
    
    // Append json to dofusMap file
    if(x === Constants.MIN_COORDINATE_X && y === Constants.MIN_COORDINATE_Y)
      fs.writeFileSync(path.resolve(__dirname, '../../dofusHunt.json'), result.slice(0, -1) + ',', { flag: 'a' })
    else if(x === Constants.MAX_COORDINATE_X && y === Constants.MAX_COORDINATE_Y)
      fs.writeFileSync(path.resolve(__dirname, '../../dofusHunt.json'), result.slice(1), { flag: 'a' })
    else
      fs.writeFileSync(path.resolve(__dirname, '../../dofusHunt.json'), result.slice(1, -1) + ',', { flag: 'a' })
    
    // Run next coordinates recursively
    return await getHintsValues(newIterateCount)
  }

  const isDone = await getHintsValues(0) as boolean
  await browser.close()
  console.log('Group done, closing browser...\n')
  return isDone
}

(async() => {
  let isDone = false
  while(!isDone) {
    try {
      isDone = await startBrowser()
    } catch(error: any) {
      console.log(error.message)
      break
    }
  }
  console.log('Scraping done!')
})()