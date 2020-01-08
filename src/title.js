import React from 'react';
import { Button } from 'reactstrap';

/**
 * @param changePage
 * @returns {*}
 */
const Title = ({ changePage }) => (
  <h1 className="h1">
    <Button style={{ background: 'transparent' }} onClick={() => changePage(0)}>
      Hacker News
    </Button>
  </h1>
);

export default Title;
