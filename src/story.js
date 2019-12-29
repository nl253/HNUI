import React from 'react';
import { Button } from 'reactstrap';

import Comment from './comment';

/**
 * @param {boolean} isDisplayed
 * @param {Item} story
 * @param {boolean} isLoading
 * @param setUser
 * @returns {*}
 * @constructor
 */
const Story = ({ isDisplayed, story, isLoading, setUser }) => isDisplayed && (
  <div>
    <h2 className="h2 mt-2">
      <a href={story.url}>
        {story.title}
      </a>
a
    </h2>
    <p>
      Author
      <Button
        disabled={isLoading}
        className="ml-2"
        size="sm"
        onClick={() => setUser(story.by)}
      >
        {story.by}
      </Button>
    </p>
    <p dangerouslySetInnerHTML={{ __html: story.text }} />
    <div className="ml-1 mr-2">
      <h3 className="h3">Comments</h3>
      <ol style={{ paddingLeft: 0 }}>
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
