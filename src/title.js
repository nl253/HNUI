import React from 'react';
import { Button } from 'reactstrap';

const btnStyles = {
  border: 'none',
  padding: 0,
  color: 'black',
  fontSize: 'inherit',
  background: 'unset',
  margin: 0,
};

/**
 * @param changePage
 * @returns {*}
 */
const Title = ({ changePage }) => (
  <h1>
    <Button onClick={() => changePage(0)} style={btnStyles}>
      Hacker News
    </Button>
  </h1>
);

export default Title;
