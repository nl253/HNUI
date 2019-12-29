import React, { Component } from 'react';
import { loadItem, loadStories, loadUser } from './api';
import Title from './title';
import Stories from './stories';
import Paginator from './paginator';
import Story from './story';
import User from './user';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.author = 'Norbert Logiewa';
    this.year = new Date(Date.now()).getFullYear().toString();
    this.pageSize = 15;
    this.take = 6 * 15;
    this.state = {
      story: null,
      user: null,
      page: 0,
      storyList: [],
      loading: [],
    };
    this.setStory = this.setStory.bind(this);
    this.setUser = this.setUser.bind(this);
    this.clearUser = this.clearUser.bind(this);
    this.changePage = this.changePage.bind(this);
    this.initHistoryApi();
  }

  async componentDidMount() {
    await this.refreshStories();
    let page;
    let story;
    if (window.location.pathname.length > 1) {
      const parts = window.location.pathname.slice(1).split('/');
      if (!Object.is(NaN, parseInt(parts[0])) && parseInt(parts[0]) >= 0) {
        page = parseInt(parts[0]);
      }
      if (parts.length > 1 && !Object.is(NaN, parseInt(parts[1])) && parseInt(parts[1]) >= 0) {
        story = await loadItem(parts[1]);
      }
    }
    await this.changePage(page || 0);
    this.setStory(story || this.state.storyList[0]);
  }

  initHistoryApi() {
    window.addEventListener('popstate', async ({ state: { page, story } }) => {
      if (Number.isInteger(page) && page >= 0) {
        await this.changePage(page, false);
      }
      if (story !== undefined && story !== null) {
        this.setStory(story, false);
      }
    });
  }
  /**
   * @returns {Promise<void>}
   */
  async refreshStories() {
    this.beginLoading('storyList');
    const { take, pageSize, state } = this;
    const { page } = state;
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
    return item.reduce((prev, focus) => prev && loading.indexOf(focus) < 0,
      true);
  }


  /**
   * @returns {number}
   */
  get pageCount() {
    const { take, pageSize } = this;
    return Math.ceil(take / pageSize);
  }

  /**
   * @param {number} p
   * @param {boolean} logHistory
   * @returns {Promise<void>}
   */
  changePage(p, logHistory = true) {
    const { storyList, page, story } = this.state;
    if (page !== p) {
      if (logHistory) {
        window.history.pushState({ page: p, story }, `Hacker News page ${p}`, `/${p}/${story && story.id ? story.id : storyList[0].id}`);
      }
      this.setState({ page: p, storyList: [] });
      return this.refreshStories();
    }
    return Promise.resolve();
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

  /**
   * @param {Item} story
   * @param {boolean} logHistory
   */
  setStory(story, logHistory = true) {
    if (this.state.story !== story) {
      const { page } = this.state;
      if (logHistory) {
        window.history.pushState({ story, page }, `Hacker News story "${story.title}"`, `/${page || 0}/${story.id}`);
      }
      this.setState({ story });
    }
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
