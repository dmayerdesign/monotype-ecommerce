import 'jasminewd2'
import { AppPage } from './app.po'

describe('time-admin App', () => {
  let page: AppPage

  beforeEach(() => {
    page = new AppPage()
  })

  it('should display welcome message', async () => {
    page.navigateTo()
    const paragraphText = page.getParagraphText()
    expect(paragraphText).toEqual('Welcome to app!')
  })
})
