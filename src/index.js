import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import {author} from '../package.json';
import {lexer, parser} from 'marked';

import './index.scss';
import {LIST_LEN, loadStories, loadUser} from './api';
import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  Pagination,
  PaginationItem,
  PaginationLink,
  Toast,
  ToastBody,
  ToastHeader,
} from 'reactstrap';
import {Comment} from './comment';
import {fmtUNIXTime} from './utils';

class App extends Component {
  constructor(props) {
    super(props);
    this.author = author;
    this.year = new Date(Date.now()).getFullYear().toString();
    this.state = {
      story: null,
      user: null,
      page: 0,
      pageSize: 15,
      take: 15 * 6,
      storyList: [],
      comments: [],
      loading: [],
    };
    this.setUser = this.setUser.bind(this);
    setImmediate(() => this.refreshStories());
  }

  async refreshStories() {
    this.beginLoading('storyList');
    this.setState( {
      storyList: await loadStories(
        'topstories',
        this.state.take,
        this.state.page,
        this.state.pageSize,
      ),
    });
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
   * @return {number}
   */
  get pageCount() {
    return Math.ceil(this.state.take / this.state.pageSize);
  }

  /**
   * @param {number} page
   */
  changePage(page) {
    if (this.state.page !== page) {
      this.setState({ page });
      this.refreshStories();
    }
  }

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
      <div className="container-fluid">
        <main className="row">
          <section className="col-sm-12 col-md-5 col-lg-5 col-xl-5">
            <h1><Button style={{border: 'none', padding: 'none', color: 'black', fontSize: 'inherit', background: 'unset'}} onClick={() => this.changePage(0)}>Hacker News</Button></h1>
            <ListGroup>
              {this.state.storyList.map((story, idx) => (
                  <ListGroupItem key={idx}
                                 style={{padding: 0}}
                                 active={this.state.story === story}>
                    <Button disabled={!this.story && !this.didLoad('story')}
                            active={this.state.story === story}
                            style={{width: '100%', textAlign: 'left'}}
                            onClick={e => {
                        e.preventDefault();
                        this.setState({ story });
                      }}>
                      <Badge pill color={story.score > 300 ? 'danger' : story.score > 100 ? 'warning' : 'primary'}>
                        <span>{story.score}</span>
                      </Badge>
                      <span>{story.title}</span>
                      <br/>
                      <Badge pill color="info" className="float-right">
                        <span>{story.descendants}</span> comments
                      </Badge>
                    </Button>
                  </ListGroupItem>
                )
              )}
            </ListGroup>
            <Pagination size="sm">
              <PaginationItem disabled={this.state.page === 0}>
                <PaginationLink onClick={() => this.changePage(this.state.page - 1)}
                                previous
                                href="#" />
              </PaginationItem>
              {Array(this.pageCount).fill(0).map((_, idx) => (
                  <PaginationItem onClick={() => this.changePage(idx)}
                                  active={this.state.page === idx}
                                  key={idx}>
                    <PaginationLink href="#" >{idx + 1}</PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem disabled={this.state.page - 1 === this.pageCount}>
                <PaginationLink onClick={() => this.changePage(this.state.page + 1)}
                                next
                                href="#" />
              </PaginationItem>
            </Pagination>
          </section>
          <section className="col-sm-12 col-md-7 col-lg-7 col-xl-7">
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
                    {(this.state.story.kids || []).map((id, idx) => <Comment setUser={this.setUser.bind(this)} depth={1} key={idx} id={id}/>)}
                  </ol>
                </div>
              </div>
            )}
          </section>
        </main>
        {this.state.user && (
          <Toast style={{position: 'fixed', bottom: '10px', right: '10px'}}>
            <ToastHeader>
              User <span>{this.state.user.id}</span> <span>(<span>{this.state.user.karma}</span> karma)</span>
            </ToastHeader>
            <ToastBody>
              <p>
                Created <span>{fmtUNIXTime(this.state.user.created)}</span>
              </p>
              <p dangerouslySetInnerHTML={{__html: parser(lexer(this.state.user.about || ''))}}/>
              <Button size="sm" onClick={() => this.clearUser()} color="danger">Close</Button>
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
