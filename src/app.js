/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import { Button } from 'reactstrap';
import {
  clearCache,
  loadItem,
  loadStories,
  loadUser,
} from './api';
import Paginator from './paginator';
import Stories from './stories';
import Story from './story';
import Title from './title';
import User from './user';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      story: null,
      user: null,
      page: 0,
      pageSize: 15,
      pageCount: 6,
      storyList: [],
      loading: [],
    };
    this.setStory = this.setStory.bind(this);
    this.setUser = this.setUser.bind(this);
    this.clearUser = this.clearUser.bind(this);
    this.clearStory = this.clearStory.bind(this);
    this.changePage = this.changePage.bind(this);
    this.refreshStories = this.refreshStories.bind(this);
    window.onpopstate = (o) => this.setState({ ...o.state });
  }

  async componentDidMount() {
    await this.refreshStories();
    const parts = window.location.pathname.slice(1).split('/');
    const storyId = parseInt(parts[1]);
    const { state } = this;
    const { story, page, storyList } = state;
    if (parts.length === 2 && !isNaN(storyId)) {
      if (story === null || story.id !== storyId) {
        await this.setStory(await loadItem(storyId));
      }
    }
    const p = parseInt(parts[0]);
    if (parts.length >= 1 && !isNaN(p) && page !== p) {
      this.changePage(p);
    }
    if (parts.length === 0) {
      this.setStory(storyList[0]);
    }
  }

  /**
   * @return {Promise<void>}
   */
  async refreshStories() {
    document.body.classList.add('loading');
    this.beginLoading('storyList');
    this.setState({ storyList: [], page: 0 });
    const { pageCount, pageSize } = this.state;
    for await (const story of loadStories('topstories', pageCount, pageSize)) {
      this.setState(({ storyList }) => ({
        storyList: storyList.concat([story]),
      }));
    }
    this.endLoading('storyList');
    document.body.classList.remove('loading');
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
      for (let i = 0; i < loading.length; i += 1) {
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
   * @param {...string} items
   * @returns {boolean}
   */
  didLoad(...items) {
    const { loading } = this.state;
    return items.reduce((prev, focus) => prev && loading.indexOf(focus) < 0, true);
  }


  /**
   * @param {number|null} page
   * @param {boolean} [doSaveHistory]
   */
  changePage(page, doSaveHistory = true) {
    if (doSaveHistory) {
      this.saveHistory({ ...this.state, page });
    }
    this.setState({ page });
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

  clearStory() {
    this.setState({ story: null });
  }

  /**
   * @param {Item|null} story
   * @param {boolean} [doSaveHistory]
   */
  setStory(story, doSaveHistory = true) {
    if (doSaveHistory) {
      this.saveHistory({ ...this.state, story });
    }
    this.setState({ story });
  }

  /**
   * @param {Record<string, *>} state
   */
  saveHistory(state) {
    const { page, story } = state;
    let title = `HN UI - page ${page}`;
    let url = `/${page}`;
    if (story !== null) {
      url += `/${story.id}`;
      title += ` "${story.title}"`;
    }
    window.history.pushState(state, title, url);
  }

  /**
   * @returns {*}
   */
  render() {
    const {
      user,
      storyList,
      pageSize,
      pageCount,
      page,
      story,
    } = this.state;
    return (
      <div className="container-fluid">
        <main className="row">
          <section className="col-sm-12 col-md-5 col-lg-5 col-xl-5">
            <Title refresh={async () => {
              const p = clearCache();
              this.clearStory();
              await p;
              await this.refreshStories();
            }}
            />
            {!!story && (
              <div className="d-sm-none d-md-block d-lg-block d-xl-block d-none">
                <Stories
                  page={page}
                  pageSize={pageSize}
                  pageCount={pageCount}
                  isLoading={!this.didLoad('storyList')}
                  setStory={this.setStory}
                  story={story}
                  storyList={storyList}
                />
              </div>
            )}
            {!story && (
              <div className="">
                <Stories
                  page={page}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  isLoading={!this.didLoad('storyList')}
                  setStory={this.setStory}
                  story={story}
                  storyList={storyList}
                />
              </div>
            )}
            {storyList.length > 0 && (
              <div className="mt-3 d-none d-xl-block d-lg-block d-md-block d-sm-none">
                <Paginator
                  page={page}
                  pageCount={pageCount}
                  isDisabled={!this.didLoad('storyList')}
                  changePage={this.changePage}
                />
              </div>
            )}
            {storyList.length > 0 && (
              <div className="mt-3 d-block d-xl-none d-lg-none d-md-none d-sm-block">
                {story === null && (
                  <Paginator
                    page={page}
                    isDisabled={!this.didLoad('storyList')}
                    pageCount={pageCount}
                    changePage={this.changePage}
                  />
                )}
              </div>
            )}
          </section>
          <section className="col-sm-12 col-md-7 col-lg-7 col-xl-7">
            {story !== null && (
              <div>
                <Button
                  className="d-block d-xl-none d-lg-none d-md-none mx-auto mt-sm text-white p-1 mb-4"
                  style={{ width: '80%', maxWidth: '200px', fontSize: '1rem' }}
                  size="lg"
                  onClick={() => this.clearStory()}
                  color="warning"
                >
                  Back
                </Button>
              </div>
            )}
            <Story
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
        <footer className="mt-2">
          <p className="text-center mx-auto">
            Copyright &copy;
            {' '}
            <span>Norbert Logiewa</span>
            {' '}
            <time>{new Date(Date.now()).getFullYear().toString()}</time>
          </p>
        </footer>
      </div>
    );
  }
}
