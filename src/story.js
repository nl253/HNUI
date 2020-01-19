/* eslint-disable react/no-danger */
import React from 'react';
import { Button } from 'reactstrap';

import Comment from './comment';
import UserBtn from './user-btn';

/**
 * @param {boolean} isDisplayed
 * @param {Item} story
 * @param {boolean} isLoading
 * @param setUser
 * @returns {*}
 * @constructor
 */
const Story = ({
  isDisplayed, story, isLoading, setUser,
}) => isDisplayed && (
  <div>
    <h2 className="h2 mt-2">
      <a href={story.url}>
        {story.title}
      </a>
    </h2>
    <p>Author <UserBtn setUser={setUser} name={story.by} id={story.by} /></p>
    <p dangerouslySetInnerHTML={{ __html: story.text }} />
    <div className="ml-1 mr-2">
      <h3 className="h3">Comments</h3>
      <ol className="pl-0">
        {story.kids.map((id) => (
          <Comment
            setUser={setUser}
            depth={0}
            key={id}
            id={id}
          />
        ))}
      </ol>
    </div>
  </div>
);

export default Story;
