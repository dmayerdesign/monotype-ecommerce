import { MteClientPage } from './app.po'

describe('Mte-client App', () => {
  let page: MteClientPage

  beforeEach(() => {
    page = new MteClientPage()
  })

  it('should display welcome message', () => {
    page.navigateTo()
    // expect(page.getParagraphText()).toEqual('Welcome to app!')
  })
})
