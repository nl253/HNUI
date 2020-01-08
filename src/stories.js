import React from 'react';
import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  Spinner,
} from 'reactstrap';

const getBadgeColor = (score) => {
  if (score > 300) {
    return 'danger';
  }
  if (score > 100) {
    return 'warning';
  }
  return 'primary';
};

const spinnerStyles = {
  width: '3rem',
  height: '3rem',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
};

/**
 * @param {boolean} isLoading
 * @param setStory
 * @param {Item} story
 * @param {Item[]} storyList
 * @returns {*}
 */
const Stories = ({
  isLoading,
  setStory,
  story,
  storyList,
}) => (
  isLoading
    ? (
      <Spinner
        className="mt-5"
        style={spinnerStyles}
      />
    )
    : (
      <ListGroup>
        {storyList.map((s) => (
          <ListGroupItem
            key={s.id}
            style={{ padding: 0, background: 'transparent' }}
            active={story === s}
          >
            <Button
              disabled={isLoading}
              active={story === s}
              style={{ width: '100%', textAlign: 'left', background: 'transparent' }}
              onClick={(e) => {
                e.preventDefault();
                setStory(s);
              }}
            >
              <Badge pill color={getBadgeColor(s.score)}>
                <span>{s.score}</span>
              </Badge>
              <span>{s.title}</span>
              <br />
              <Badge pill color="info" className="float-right">
                <span>{s.descendants}</span>
                {' '}
                comments
              </Badge>
            </Button>
          </ListGroupItem>
        ))}
      </ListGroup>
    )
);

export default Stories;
