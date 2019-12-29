import React from 'react';
import {Badge, Button, ListGroup, ListGroupItem, Spinner} from 'reactstrap';

/**
 * @param {boolean} isLoading
 * @param setStory
 * @param {Item} story
 * @param {Item[]} storyList
 * @return {*}
 */
export const Stories = ({isLoading, setStory, story, storyList}) => (
  isLoading
    ? <Spinner className='mt-5' style={{width: '3rem', height: '3rem' , marginLeft: 'auto', marginRight: 'auto', display: 'block'}}/>
    : (<ListGroup>
      {storyList.map((s, idx) => (
          <ListGroupItem key={idx}
                         style={{padding: 0}}
                         active={story === s}>
            <Button disabled={isLoading}
                    active={story === s}
                    style={{width: '100%', textAlign: 'left'}}
                    onClick={e => {
                      e.preventDefault();
                      setStory(s);
                    }}>
              <Badge pill color={s.score > 300 ?
                'danger' :
                s.score > 100 ? 'warning' : 'primary'}>
                <span>{s.score}</span>
              </Badge>
              <span>{s.title}</span>
              <br/>
              <Badge pill color="info" className="float-right">
                <span>{s.descendants}</span> comments
              </Badge>
            </Button>
          </ListGroupItem>
        ),
      )}
    </ListGroup>)
);
