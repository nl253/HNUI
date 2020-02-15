import React from 'react';
import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';

export default class Stories extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderBy: 'hotness',
      storyListOrdered: [],
    };
  }

  componentDidMount() {
    this.reorder(this.state.orderBy, this.props.page, this.props.storyList);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.story !== prevProps.story ||
      this.props.isLoading !== prevProps.isLoading ||
      prevProps.page !== this.props.page ||
      prevState.orderBy !== this.state.orderBy) {
      this.reorder(this.state.orderBy, this.props.page, this.props.storyList);
    }
  }

  /**
   * @param {'freshness'
   *        |'votes'
   *        |'comments'
   *        |'hotness'
   *        } orderBy
   */
  reorder(orderBy, page, storyList) {
    const { props: { pageSize } } = this;
    let f;
    if (orderBy === 'freshness') {
      f = (x1, x2) => (x2.time >= x1.time ? 1 : -1);
    } else if (orderBy === 'votes') {
      f = (x1, x2) => (x2.score >= x1.score ? 1 : -1);
    } else if (orderBy === 'hotness') {
      f = (x1, x2) => (x2.ord > x1.ord ? 1 : x2.ord === x1.ord ? 0 : -1);
    } else if (orderBy === 'comments') {
      f = (x1, x2) => (x2.descendants >= x1.descendants ? 1 : -1);
    } else {
      throw new Error(`unrecognised sorting scheme ${orderBy}`);
    }
    const storyListOrdered = [...storyList].sort(f).slice(page * pageSize, (page + 1) * pageSize);
    this.setState({ orderBy, storyListOrdered });
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
    const { props: { isLoading, setStory, story, storyList, page }, state: { storyListOrdered } } = this;
    return (
      isLoading
        ? (
          <p className="mx-auto text-center" style={{ fontSize: '1.35rem' }}>
            Loading
            <br/>
            {'.'.repeat(1 + new Date().getSeconds() % 6)}
          </p>
          // <Spinner
          //   className="mt-5 mr-auto ml-auto d-block"
          //   color="secondary"
          //   style={{ width: '3rem', height: '3rem' }}
          // />
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
                onClick={() => this.reorder('freshness', page, storyList)}
              >
                Freshness
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
              <Button
                color="danger"
                onClick={() => this.reorder('hotness', page, storyList)}
              >
                Hot
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
              <Button
                color="warning"
                className="text-white"
                onClick={() => this.reorder('votes', page, storyList)}
              >
                Upvotes
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
              <Button
                color="primary"
                onClick={() => this.reorder('comments', page, storyList)}
              >
                Comments
                <p className="rotate-90 p-0 m-0 d-inline-block ml-2 position-relative" style={{ top: '2px' }}>&gt;</p>
              </Button>
            </div>

            <ListGroup>
              {storyListOrdered.map((s) => (
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
