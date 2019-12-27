import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import {author} from '../package.json';
import {lexer, parser} from 'marked';

import './index.scss';
import {loadItem, loadStories, loadUser} from './api';
import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  Toast,
  ToastBody,
  ToastHeader,
} from 'reactstrap';

/**
 * @param {number} tm
 * @return {string}
 */
const fmtUNIXTime = tm => {
  const date = new Date(tm * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      collapsed: false,
      text: null,
      comment: null,
    };
    this.init();
  }

  async init() {
    const comment = await loadItem(this.props.id);
    this.setState({
      comment,
      isVisible: comment.type === 'comment' && comment.text,
    });
  }

  toggle() {
    this.setState(({ collapsed }) => ({collapsed: !collapsed}));
  }

  render() {
    return (
      this.state.isVisible ?
        (
          <div className="p-2 rounded m-2" style={{background: `hsl(0, 0%, ${93 - this.props.depth * 8}%)`}}>
            <p className="font-weight-bold">{this.state.comment.by}</p>
            <p className="font-italic">{fmtUNIXTime(this.state.comment.time)}</p>
            <p dangerouslySetInnerHTML={{__html: parser(lexer(this.state.comment.text || ''))}}/>
            {(this.state.comment.kids || []).length > 0 &&
              (
                <Button color={!this.state.collapsed ? 'warning' : 'info'} size="sm" className="mb-2" onClick={() => this.toggle()}>
                  {this.state.collapsed ? `show ${(this.state.comment.kids || []).length || 0}` : 'hide'}
                </Button>
              )
            }
            <ol style={{display: this.state.collapsed ? 'none' : 'block', paddingLeft: `${this.props.depth * 7}px`}}>
              {(this.state.comment.kids || []).map((id, cIdx) => <Comment depth={this.props.depth + 1} key={cIdx} id={id} />)}
            </ol>
          </div>
        )
        : null
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.author = author;
    this.year = new Date(Date.now()).getFullYear().toString();
    this.state = {
      story: null,
      user: null,
      storyList: [],
      comments: [],
      loading: ['storyList'],
    };
    this.init();
  }

  async init() {
    this.setState( { storyList: await loadStories() });
    this.endLoading('storyList');
  }

  /**
   * @param {string} what
   */
  beginLoading(what) {
    this.setState({loading: [...this.state.loading, what]});
  }

  /**
   * @param {string} what
   */
  endLoading(what) {
    this.setState(({ loading }) => {
      for (let i = 0; i < loading.length; i++) {
        if (loading[i] === what) {
          return {
            loading: loading.slice(0, i).concat(loading.slice(i + 1)),
          };
        }
      }
    });
  }

  /**
   * @param {string} item
   * @return {boolean}
   */
  didLoad(...item) {
    return item.reduce((prev, focus) => prev && this.state.loading.indexOf(focus) < 0, true);
  }

  /**
   * @param {Item}
   * @return {Promise<void>}
   */
  async setStory({ id }) {
    this.beginLoading('story');
    this.setState({
      story: await loadItem(id),
    });
    this.endLoading('story');
  }

  /**
   * @return {Promise<void>}
   */
  clearStory() {
    this.setState({ comments: [], story: null });
  }

  /**
   * @param {string} name
   * @return {Promise<void>}
   */
  async setUser(name) {
    this.beginLoading('user');
    this.setState({ user: await loadUser(name) });
    this.endLoading('user');
  }

  /**
   * @return {Promise<void>}
   */
  clearUser() {
    this.setState({ user: null });
  }

  /**
   * @returns {*}
   */
  render() {
    return (
      this.didLoad('storyList') &&
      <div>
        <main>
          <section>
            <ListGroup>
              {this.state.storyList.map((story, idx) => (
                  <ListGroupItem key={idx}
                                 style={{padding: 0}}
                                 active={this.state.story === story}>
                    <Button disabled={!this.story && !this.didLoad('story')}
                            style={{width: '100%', textAlign: 'left'}}
                            onClick={async (e) => {
                        e.preventDefault();
                        this.clearStory();
                        await this.setStory(story);
                      }}>
                      <Badge pill color={story.score > 300 ? 'danger' : story.score > 100 ? 'warning' : 'primary'}>
                        <span>{story.score}</span> score
                      </Badge>
                      <span>{story.title}</span>
                      <Badge pill color="info">
                        <span>{story.descendants}</span> comments
                      </Badge>
                    </Button>
                  </ListGroupItem>
                )
              )}
            </ListGroup>
          </section>
          <section>
            {this.state.story && (
              <div>
                <h2><a href={this.state.story.url}>{this.state.story.title}</a></h2>
                <p>Author
                  <Button disabled={!this.state.user && !this.didLoad('user')}
                          className="ml-2"
                          size="sm"
                          onClick={() => this.setUser(this.state.story.by)}>
                    {this.state.story.by}
                  </Button>
                </p>
                <p dangerouslySetInnerHTML={{__html: this.state.story.text}} />
                <div className="ml-1 mr-2">
                  <h3>Comments</h3>
                  <ol style={{paddingLeft: 0}}>
                    {(this.state.story.kids || []).map((id, idx) => <Comment depth={1} key={idx} id={id}/>)}
                  </ol>
                </div>
              </div>
            )}
          </section>
        </main>
        {this.state.user && (
          <Toast style={{position: 'fixed', bottom: '10px', right: '10px'}}
                 onClick={() => this.clearUser()}>
            <ToastHeader>
              User <span>{this.state.user.id}</span> <span>(<span>{this.state.user.karma}</span> karma)</span>
            </ToastHeader>
            <ToastBody>
              <p>
                Created <span>{(new Date(this.state.user.created)).toDateString()}</span>
              </p>
              <p dangerouslySetInnerHTML={{__html: this.state.user.about}}/>
            </ToastBody>
          </Toast>
        )}
        <footer>
          <p className="text-center mx-auto">
            Copyright &copy; <span>{this.author.name}</span> <span>{this.year}</span>
          </p>
        </footer>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
serviceWorker.unregister();
