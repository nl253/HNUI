import React from 'react';
import {
  Badge, Button, ListGroup, ListGroupItem, Spinner,
} from 'reactstrap';

export default class Stories extends React.Component {
  constructor(props) {
    super(props);
    const { storyList, pageSize, page } = props;
    this.state = {
      storyList: storyList.slice(page * pageSize, (page + 1) * pageSize),
    };
  }

  componentDidMount() {
    this.reorder('freshness');
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { page, pageSize } = this.props;
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.storyList = this
      .props
      .storyList
      .slice(page * pageSize, (page + 1) * pageSize);
  }

  /**
   * @param {'freshness'
   *        |'votes'
   *        |'comments'
   *        |'hotness'
   *        } sortBy
   */
  reorder(sortBy) {
    const {
      storyList,
      page,
      pageSize,
    } = this.props;
    if (sortBy === 'freshness') {
      storyList.sort((x1, x2) => (x2.time >= x1.time ? 1 : -1));
    } else if (sortBy === 'votes') {
      storyList.sort((x1, x2) => (x2.score >= x1.score ? 1 : -1));
    } else if (sortBy === 'hotness') {
      storyList.sort((x1, x2) => (x2.ord >= x1.ord ? 1 : -1));
    } else if (sortBy === 'comments') {
      storyList.sort((x1, x2) => (x2.descendants >= x1.descendants ? 1 : -1));
    }
    this.setState({
      storyList: storyList.slice(page * pageSize, (page + 1) * pageSize),
    });
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
            className="mt-5"
            style={{
              width: '3rem',
              height: '3rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block',
            }}
          />
        )
        : (
          <div>
            <div
              style={{
                marginTop: '40px',
                marginBottom: '20px',
                flexWrap: 'nowrap',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
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
              {this.state.storyList.map((s) => (
                <ListGroupItem
                  key={s.id}
                  style={{ padding: 0, background: 'transparent' }}
                  active={story !== null && story.id === s.id}
                >
                  <Button
                    disabled={isLoading}
                    active={story !== null && story.id === s.id}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                    }}
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
