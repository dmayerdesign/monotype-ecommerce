import { SortDirection } from '../models/enums/sort-direction'

export class Crud {
    public static readonly Pagination = {
        productsPerPage: 30,
    }
    public static readonly Sorting = {
        defaultSortField: 'createdAt',
        defaultSortDirection: SortDirection.Descending,
    }
}
