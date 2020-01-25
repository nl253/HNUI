import React from 'react';
import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  Spinner,
} from 'reactstrap';

export default class Stories extends React.Component {
  constructor(props) {
    super(props);
    this.state = { orderBy: 'hotness' };
  }

  /**
   * @param {'freshness'
   *        |'votes'
   *        |'comments'
   *        |'hotness'
   *        } orderBy
   */
  reorder(orderBy) {
    this.setState({ orderBy });
  }

  /**
   * @return {Array<*>}
   */
  getOrdered() {
    const { props } = this;
    const { page, pageSize } = props;
    const storyList = [...props.storyList];
    const { orderBy } = this.state;
    if (orderBy === 'freshness') {
      storyList.sort((x1, x2) => (x2.time >= x1.time ? 1 : -1));
    } else if (orderBy === 'votes') {
      storyList.sort((x1, x2) => (x2.score >= x1.score ? 1 : -1));
    } else if (orderBy === 'hotness') {
      storyList.sort((x1, x2) => (x2.ord >= x1.ord ? 1 : -1));
    } else if (orderBy === 'comments') {
      storyList.sort((x1, x2) => (x2.descendants >= x1.descendants ? 1 : -1));
    }
    return storyList.slice(page * pageSize, (page + 1) * pageSize);
  }

  /**
   * @param {number} score
   * @returns {'danger'|'warning'|'primary'}
   */
  static getBadgeColor(score) {
    if (score > 300) {
      return 'danger';
    }
    if (score > 100) {
      return 'warning';
    }
    return 'primary';
  }

  render() {
    const { isLoading, setStory, story } = this.props;
    return (
      isLoading
        ? (
          <Spinner
            className="mt-5 mr-auto ml-auto d-block"
            style={{ width: '3rem', height: '3rem' }}
          />
        )
        : (
          <div className="mt-sm-2 mt-md-2 mt-lg-3 mt-xl-3 mt-sm-0">
            <div
              className="flex-row d-flex flex-nowrap align-items-center justify-content-around mb-4 mb-sm-4 mb-md-2 mb-lg-3 mb-xl-3"
            >
              <Button
                color="success"
                className="d-sm-none d-md-inline d-lg-inline d-xl-inline d-none"
                size="sm"
                onClick={() => this.reorder('freshness')}
              >
                Freshness
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
              <Button
                color="danger"
                onClick={() => this.reorder('hotness')}
              >
                Hot
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
              <Button
                color="warning"
                className="text-white"
                onClick={() => this.reorder('votes')}
              >
                Upvotes
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
              <Button
                color="primary"
                onClick={() => this.reorder('comments')}
              >
                Comments
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
            </div>

            <ListGroup>
              {this.getOrdered().map((s) => (
                <ListGroupItem
                  key={s.id}
                  className="p-0 bg-transparent"
                  active={story !== null && story.id === s.id}
                >
                  <Button
                    disabled={isLoading}
                    active={story !== null && story.id === s.id}
                    className="bg-transparent w-100 text-left"
                    onClick={(e) => {
                      e.preventDefault();
                      setStory(s);
                    }}
                  >
                    <Badge pill color={Stories.getBadgeColor(s.score)}>
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

          </div>
        )
    );
  }
}
