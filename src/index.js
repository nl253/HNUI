import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { author } from '../package.json';
import { loadStories, loadUser } from './api';

import './index.scss';

import Paginator from './paginator';

import * as serviceWorker from './serviceWorker';
import Stories from './stories';
import Story from './story';
import Title from './title';
import User from './user';

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
      loading: [],
    };
    this.setStory = this.setStory.bind(this);
    this.setUser = this.setUser.bind(this);
    this.clearUser = this.clearUser.bind(this);
    this.changePage = this.changePage.bind(this);
    setTimeout(() => this.refreshStories(), 100);
  }

  async refreshStories() {
    this.beginLoading('storyList');
    const { take, page, pageSize } = this.state;
    this.setState({
      storyList: await loadStories('topstories', take, page, pageSize),
    });
    this.endLoading('storyList');
  }

  /**
   * @param {string} what
   */
  beginLoading(what) {
    this.setState(({ loading }) => ({ loading: [...loading, what] }));
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
      return { loading };
    });
  }

  /**
   * @param {string} item
   * @returns {boolean}
   */
  didLoad(...item) {
    const { loading } = this.state;
    return item.reduce((prev, focus) => prev && loading.indexOf(focus) < 0, true);
  }


  /**
   * @returns {number}
   */
  get pageCount() {
    const { take, pageSize } = this.state;
    return Math.ceil(take / pageSize);
  }

  /**
   * @param {number} page
   */
  changePage(page) {
    if (this.state.page !== page) {
      this.setState({ page, storyList: [] });
      this.refreshStories();
    }
  }

  /**
   * @param {string} name
   * @returns {Promise<void>}
   */
  async setUser(name) {
    this.beginLoading('user');
    this.setState({ user: await loadUser(name) });
    this.endLoading('user');
  }

  clearUser() {
    this.setState({ user: null });
  }

  setStory(story) {
    this.setState({ story });
  }

  /**
   * @returns {*}
   */
  render() {
    const { user, storyList, page, story } = this.state;
    return (
      <div className="container-fluid">
        <main className="row">
          <section className="col-sm-12 col-md-5 col-lg-5 col-xl-5">
            <Title changePage={this.changePage} />
            <Stories
              isLoading={storyList.length === 0 && !this.didLoad('storyList')}
              setStory={this.setStory}
              story={story}
              storyList={storyList}
            />
            <Paginator
              page={page}
              isDisplayed={storyList.length > 0 && this.didLoad('storyList')}
              pageCount={this.pageCount}
              changePage={this.changePage}
            />
          </section>
          <section className="col-sm-12 col-md-7 col-lg-7 col-xl-7">
            <Story
              isLoading={!user && !this.didLoad('user')}
              isDisplayed={!!story}
              setUser={this.setUser}
              story={story}
            />
          </section>
        </main>
        <User
          user={user}
          clearUser={this.clearUser}
          isDisplayed={!!user}
        />
        <footer>
          <p className="text-center mx-auto">
            Copyright &copy;
            {' '}
            <span>{this.author.name}</span>
            {' '}
            <span>{this.year}</span>
          </p>
        </footer>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
