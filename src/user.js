/* eslint-disable react/no-danger */
import React from 'react';

import {
  Button,
  Toast,
  ToastBody,
  ToastHeader,
} from 'reactstrap';
import { lexer, parser } from 'marked';

import { fmtUNIXTime } from './utils';

/**
 * @param {UserModel} user
 * @param clearUser
 * @param {boolean} isDisplayed
 * @returns {*}
 */
const User = ({ user, clearUser, isDisplayed }) => (isDisplayed && (
  <Toast style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
    <ToastHeader>
        User{' '}{user.id}({user.karma}{' '}karma)
    </ToastHeader>
    <ToastBody>
      <p>Created{' '}{fmtUNIXTime(user.created)}</p>
      <p dangerouslySetInnerHTML={{ __html: parser(lexer(user.about || '')) }} />
      <Button
        size="sm"
        onClick={() => clearUser()}
        color="danger"
      >
          Close
      </Button>
    </ToastBody>
  </Toast>
)
);

export default User;
