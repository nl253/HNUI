import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import {author} from '../package.json';

import './index.scss';
import {loadStories, loadUser} from './api';
import {User} from './user';
import {Paginator} from './paginator';
import {Stories} from './stories';
import {Title} from './title';
import {Story} from './story';

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
    this.setStory = this.setStory.bind(this);
    this.setUser = this.setUser.bind(this);
    this.clearUser = this.clearUser.bind(this);
    this.changePage = this.changePage.bind(this);
    setTimeout(() => this.refreshStories(), 100);
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
    this.setState(({loading}) => {
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
      this.setState({page, storyList: []});
      this.refreshStories();
    }
  }

  /**
   * @param {string} name
   * @return {Promise<void>}
   */
  async setUser(name) {
    this.beginLoading('user');
    this.setState({user: await loadUser(name)});
    this.endLoading('user');
  }

  /**
   * @return {Promise<void>}
   */
  clearUser() {
    this.setState({user: null});
  }

  setStory(story) {
    this.setState({ story });
  }

  /**
   * @returns {*}
   */
  render() {
    return (
      <div className="container-fluid">
        <main className="row">
          <section className="col-sm-12 col-md-5 col-lg-5 col-xl-5">
            <Title changePage={this.changePage} />
            <Stories isLoading={this.state.storyList.length === 0 && !this.didLoad('storyList')}
                     setStory={this.setStory}
                     story={this.state.story}
                     storyList={this.state.storyList} />
            <Paginator page={this.state.page}
                       isDisplayed={this.state.storyList.length > 0 && this.didLoad('storyList')}
                       pageCount={this.pageCount}
                       changePage={this.changePage} />
          </section>
          <section className="col-sm-12 col-md-7 col-lg-7 col-xl-7">
            <Story isLoading={!this.state.user && !this.didLoad('user')}
                   isDisplayed={!!this.state.story}
                   setUser={this.setUser}
                   story={this.state.story} />
          </section>
        </main>
        <User user={this.state.user}
              clearUser={this.clearUser}
              isDisplayed={!!this.state.user} />
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

