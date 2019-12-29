import { lexer, parser } from 'marked';
import React, { Component } from 'react';
import { Button } from 'reactstrap';

import { loadItem } from './api';
import { fmtUNIXTime } from './utils';


export default class Comment extends Component {
  constructor(props) {
    super(props);
    const { depth } = this.props;
    const deltaColor = 5;
    const deltaIndent = 2;
    const start = 100;
    this.background = `hsl(0, 0%, ${start - depth * deltaColor}%)`;
    this.indent = `${depth * deltaIndent}px`;
    this.state = {
      isDisplayed: false,
      kids: [],
      collapsed: true,
      comment: null,
    };
    this.init();
  }

  async init() {
    const { depth, setUser, id } = this.props;
    const comment = await loadItem(id);
    if (this._isMounted === true) {
      this.setState({
        comment,
        isDisplayed: comment && comment.type === 'comment' && comment.text,
        kids: comment.kids.map((kId) => <Comment setUser={setUser} depth={depth + 1} key={kId} id={kId} />),
      });
    }
  }
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  toggle() {
    this.setState(({ collapsed }) => ({ collapsed: !collapsed }));
  }

  render() {
    const { comment, kids, collapsed, isDisplayed } = this.state;
    return (
      isDisplayed
        ? (
          <div className="p-2 rounded m-2" style={{ background: this.background }}>
            <p className="font-weight-bold">
              <Button size="sm" className="font-weight-bold" style={{ paddingLeft: 0, borderLeft: 0 }} onClick={() => this.props.setUser(comment.by)}>
                {comment.by}
              </Button>
            </p>
            <p className="font-italic">{fmtUNIXTime(comment.time)}</p>
            <p dangerouslySetInnerHTML={{ __html: parser(lexer(comment.text || '')) }} />
            {comment.kids.length > 0 && (
              <div>
                <Button
                  color={!collapsed ? 'warning' : 'info'}
                  size="sm"
                  className="mb-2"
                  onClick={() => this.toggle()}
                >
                  {collapsed
                    ? `show ${comment.kids.length} replies`
                    : 'hide'}
                </Button>
                <ol style={{ display: collapsed ? 'none' : 'block', paddingLeft: this.indent }}>{kids}</ol>
              </div>
            )}
          </div>
        )
        : null
    );
  }
}
