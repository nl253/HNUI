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
    this.changePage = this.changePage.bind(this);
    this.refreshStories = this.refreshStories.bind(this);
    this.initHistoryApi();
  }

  initHistoryApi() {
    window.onpopstate = (o) => {
      if (o.state !== null) {
        const { story, page } = o.state;
        if (story !== null) {
          this.setStory(story, false);
        }
        this.changePage(page, false);
      }
    };
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
    this.beginLoading('storyList');
    document.body.classList.add('loading');
    this.setState({ storyList: [] });
    const { pageCount, pageSize } = this.state;
    for await (const story of loadStories('topstories', pageCount, pageSize)) {
      this.setState((state) => ({
        storyList: state.storyList.concat([story]),
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
   * @param {number} newPage
   * @param {boolean} [doSaveHistory]
   */
  changePage(newPage, doSaveHistory = true) {
    const { story, storyList, page } = this.state;
    if (doSaveHistory) {
      App.saveHistory(newPage, story);
    }
    if (page !== newPage || storyList.length === 0) {
      this.setState({ page: newPage });
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

  clearStory() {
    this.setStory(null);
  }

  /**
   * @param {Item|null} newStory
   * @param {boolean} [doSaveHistory]
   */
  setStory(newStory, doSaveHistory = true) {
    const { page, story } = this.state;
    if (doSaveHistory) {
      App.saveHistory(page, newStory);
    }
    if (story === null || newStory === null || story.id !== newStory.id) {
      this.setState({ story: newStory });
    }
  }

  /**
   * @param {number} newPage
   * @param {Item|null} newStory
   */
  static saveHistory(newPage, newStory) {
    if (newStory === null) {
      window.history.pushState({ story: null, page: newPage }, `Hacker News p. ${newPage}`, `/${newPage}`);
    } else {
      const { title, id } = newStory;
      window.history.pushState({ story: newStory, page: newPage }, `Hacker News "${title}" p. ${newPage}`, `/${newPage}/${id}`);
    }
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
              this.clearUser();
              await p;
              this.refreshStories();
            }}
            />
            {!!story && (
              <div className="d-sm-none d-md-block d-lg-block d-xl-block d-none">
                <Stories
                  page={page}
                  pageSize={pageSize}
                  isLoading={storyList.length === 0 && !this.didLoad('storyList')}
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
                  pageSize={pageSize}
                  isLoading={storyList.length === 0 && !this.didLoad('storyList')}
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
                  isDisabled={false}
                  pageCount={pageCount}
                  changePage={this.changePage}
                />
              </div>
            )}
            {storyList.length > 0 && (
              <div className="mt-3 d-block d-xl-none d-lg-none d-md-none d-sm-block">
                {story === null && (
                  <Paginator
                    page={page}
                    isDisabled={false}
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
                  className="d-block d-xl-none d-lg-none d-md-none mx-auto"
                  style={{ width: '40%' }}
                  size="lg"
                  onClick={() => this.clearStory()}
                  color="dark"
                >
                  Back
                </Button>
              </div>
            )}
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
        <footer style={{ marginTop: '40px' }}>
          <p className="text-center mx-auto">
            Copyright &copy;
            {' '}
            <span>Norbert Logiewa</span>
            {' '}
            <span>{new Date(Date.now()).getFullYear().toString()}</span>
          </p>
        </footer>
      </div>
    );
  }
}
