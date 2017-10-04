import { TimeClientPage } from './app.po'

describe('time-client App', () => {
  let page: TimeClientPage

  beforeEach(() => {
    page = new TimeClientPage()
  })

  it('should display welcome message', () => {
    page.navigateTo()
    expect(page.getParagraphText()).toEqual('Welcome to app!')
  })
})
