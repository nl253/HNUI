import React from 'react';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';

const wrapperStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * @param {function(number)} changePage
 * @param {number} page
 * @param {boolean} isDisabled
 * @param {number} pageCount
 * @returns {*}
 */
const Paginator = ({
  changePage,
  page,
  isDisabled,
  pageCount,
}) => (
  <div style={wrapperStyles}>
    <Pagination size="sm">
      <PaginationItem className={isDisabled || page === 0 ? 'disabled' : ''}>
        <PaginationLink
          className={isDisabled || page === 0 ? 'disabled' : ''}
          onClick={() => (!isDisabled && page > 0 ? changePage(page - 1) : null)}
          previous
          href="#"
        />
      </PaginationItem>
      {Array(pageCount).fill(0).map((_, idx) => (
        <PaginationItem
          className={isDisabled ? 'disabled' : ''}
          onClick={() => (isDisabled ? null : changePage(idx))}
          active={page === idx}
          key={idx}
        >
          <PaginationLink className={isDisabled ? 'disabled' : ''} href="#">{idx + 1}</PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem className={isDisabled || page === pageCount - 1 ? 'disabled' : ''}>
        <PaginationLink
          className={isDisabled || page === pageCount - 1 ? 'disabled' : ''}
          onClick={() => (!isDisabled && page < pageCount - 1 ? changePage(page + 1) : null)}
          next
          href="#"
        />
      </PaginationItem>
    </Pagination>
  </div>
);

export default Paginator;
