import React from 'react';
import {Button, Toast, ToastBody, ToastHeader} from 'reactstrap';
import {fmtUNIXTime} from './utils';
import {lexer, parser} from 'marked';

/**
 * @param {UserModel} user
 * @param clearUser
 * @param {boolean} isDisplayed
 * @return {*}
 */
export const User = ({user, clearUser, isDisplayed}) => (isDisplayed && (
    <Toast style={{position: 'fixed', bottom: '10px', right: '10px'}}>
      <ToastHeader>
        User <span>{user.id}</span>
        <span>(<span>{user.karma}</span> karma)</span>
      </ToastHeader>
      <ToastBody>
        <p>
          Created <span>{fmtUNIXTime(user.created)}</span>
        </p>
        <p dangerouslySetInnerHTML={{
          __html: parser(lexer(user.about || '')),
        }}/>
        <Button size="sm" onClick={() => clearUser()}
                color="danger">Close</Button>
      </ToastBody>
    </Toast>
  )
);
