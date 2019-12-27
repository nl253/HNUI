import React, {Component} from 'react';
import {loadItem} from './api';
import {Button} from 'reactstrap';
import {lexer, parser} from 'marked';
import {fmtUNIXTime} from './utils';

export class Comment extends Component {
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
    this.setState(({collapsed}) => ({collapsed: !collapsed}));
  }

  render() {
    return (
        this.state.isVisible ?
            (
                <div className="p-2 rounded m-2" style={{
                  background: `hsl(0, 0%, ${93 - this.props.depth * 8}%)`,
                }}>
                  <p className="font-weight-bold">
                    <Button size="sm"
                            onClick={() => this.props.setUser(
                                this.state.comment.by)}>
                      {this.state.comment.by}
                    </Button>
                  </p>
                  <p className="font-italic">{fmtUNIXTime(
                      this.state.comment.time)}</p>
                  <p dangerouslySetInnerHTML={{
                    __html: parser(lexer(this.state.comment.text || '')),
                  }}/>
                  {(this.state.comment.kids || []).length > 0 &&
                  (
                      <Button color={!this.state.collapsed ? 'warning' : 'info'}
                              size="sm" className="mb-2"
                              onClick={() => this.toggle()}>
                        {this.state.collapsed ?
                            `show ${(this.state.comment.kids || []).length ||
                            0}` :
                            'hide'}
                      </Button>
                  )
                  }
                  <ol style={{
                    display: this.state.collapsed ? 'none' : 'block',
                    paddingLeft: `${this.props.depth * 7}px`,
                  }}>
                    {(this.state.comment.kids || []).map(
                        (id, cIdx) => <Comment setUser={this.props.setUser}
                                               depth={this.props.depth + 1}
                                               key={cIdx} id={id}/>)}
                  </ol>
                </div>
            )
            : null
    );
  }
}
