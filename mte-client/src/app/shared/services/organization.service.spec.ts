import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing'
import 'jasmine'
import { OrganizationService } from './organization.service'

describe('OrganizationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [OrganizationService]
    })
  })

  it('should be created', inject([OrganizationService], (service: OrganizationService) => {
    expect(service).toBeTruthy()
  }))
})
