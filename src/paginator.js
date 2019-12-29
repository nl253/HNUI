import React from 'react';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';

/**
 * @param {boolean} isDisplayed
 * @param changePage
 * @param {number} page
 * @param {number} pageCount
 * @returns {*}
 */
const Paginator = ({ isDisplayed, changePage, page, pageCount }) => (
  isDisplayed
  && (
    <Pagination size="sm">
      <PaginationItem disabled={page === 0}>
        <PaginationLink
          onClick={() => changePage(page - 1)}
          previous
          href="#"
        />
      </PaginationItem>
      {Array(pageCount).fill(0).map((_, idx) => (
        <PaginationItem
          onClick={() => changePage(idx)}
          active={page === idx}
          key={idx}
        >
          <PaginationLink href="#">{idx + 1}</PaginationLink>
        </PaginationItem>
      ),)}
      <PaginationItem disabled={page - 1 === pageCount}>
        <PaginationLink
          onClick={() => changePage(page + 1)}
          next
          href="#"
        />
      </PaginationItem>
    </Pagination>
  )
);

export default Paginator;
