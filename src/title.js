import React from 'react';
import { Button } from 'reactstrap';

/**
 * @param refresh
 * @returns {*}
 */
const Title = ({ refresh }) => (
  <h1 className="h1">
    <Button style={{ background: 'transparent' }} onClick={() => refresh(0)}>
      Hacker News
    </Button>
  </h1>
);

export default Title;
