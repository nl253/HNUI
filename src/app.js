import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { loadStories, loadUser } from './api';
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
    document.body.classList.add('loading');
    const { take, page, pageSize } = this.state;
    this.setState({
      storyList: await loadStories('topstories', take, page, pageSize),
    });
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
    this.setState({ page });
    this.refreshStories();
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

  setStory(story) {
    this.setState({ story });
  }

  /**
   * @returns {*}
   */
  render() {
    const {
      user, storyList, page, story,
    } = this.state;
    return (
      <div className="container-fluid">
        <main className="row">
          <section className="col-sm-12 col-md-5 col-lg-5 col-xl-5">
            <Title changePage={this.changePage} />
            <div className="d-none d-xl-block d-lg-block d-md-block d-sm-none">
              <Stories
                isLoading={storyList.length === 0 && !this.didLoad('storyList')}
                setStory={this.setStory}
                story={story}
                storyList={storyList}
              />
            </div>
            <div hidden={story !== null} className="d-block d-xl-none d-lg-none d-md-none d-sm-block">
              {story === null && (
                <Stories
                  isLoading={storyList.length === 0 && !this.didLoad('storyList')}
                  setStory={this.setStory}
                  story={story}
                  storyList={storyList}
                />
              )}
            </div>
            <div className="mt-3 d-none d-xl-block d-lg-block d-md-block d-sm-none" hidden={storyList.length === 0}>
              <Paginator
                page={page}
                isDisabled={!this.didLoad('storyList')}
                pageCount={this.pageCount}
                changePage={this.changePage}
              />
            </div>
            <div className="mt-3 d-block d-xl-none d-lg-none d-md-none d-sm-block" hidden={storyList.length === 0}>
              {story === null && (
                <Paginator
                  page={page}
                  isDisabled={!this.didLoad('storyList')}
                  pageCount={this.pageCount}
                  changePage={this.changePage}
                />
              )}
            </div>
          </section>
          <section className="col-sm-12 col-md-7 col-lg-7 col-xl-7">
            <div hidden={story === null}>
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
