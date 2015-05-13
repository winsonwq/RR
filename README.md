RR - Reactive React
===================

> A super tiny but purely reactive (based on [RxJS](https://github.com/Reactive-Extensions/RxJS)) implementation of [Flux](http://facebook.github.io/flux/) architecture. React-Native Supported !

## Wiki

_TODO_

1. [Create Observable React View](https://github.com/winsonwq/RR/wiki/Create-Observable-React-View)
2. [Create Observable Action](https://github.com/winsonwq/RR/wiki/Create-Observable-Action)
3. [Create Observable Store](https://github.com/winsonwq/RR/wiki/Create-Observable-Store)
4. [Example - Vote Buttons](https://github.com/winsonwq/RR/wiki/Example-(Vote-Buttons))

## Installation

```bash
$ npm install reactive-react --save
```

## Example

### Run example

```bash
$ cd examples/
$ npm i
$ npm run bundle
$ open index.html
```

### Create Observable Actions

```js
var PlusMinusAction = RR.Observable.createAction(['plus$', 'minus$', 'create$'], function(plus$, minus$, create$) {
  return {
    plusMinus$: plus$.merge(minus$),
    create$: create$
  };
});
```

### Create Observable Store

```js
var Store = RR.Observable.createStore(PlusMinusAction, ['plusMinus$', 'create$'], function(pm$, c$) {
  var data = { 1: { id: 1, val: 10 } };

  var create$ = c$.scan(data, function(sofar, curr) {
    var id = Date.now();
    sofar[id] = { id: id, val: curr.val };
    return sofar;
  });

  var pmMerge$ = pm$.scan(data, function(sofar, curr, idx) {
    sofar[curr.id] = sofar[curr.id] || { id: curr.id, val: 0 };
    sofar[curr.id].val += curr.val;
    return sofar;
  });

  return {
    data$: create$.merge(pmMerge$).startWith(data)
  };
});
```

### Create Observable Views

```js
var VoteButtons = React.createClass({

  mixins: [RR.observe(['plus$', 'minus$'])],

  getInitialState: function() {
    return { value: 0 };
  },

  minus$: function() {
    var minusOne = this.refs.btnMinusOne.getDOMNode();
    return Rx.Observable.fromEvent(minusOne, 'click').map({ val: -1, id: this.props.id });
  },

  plus$: function() {
    var plusOne = this.refs.btnPlusOne.getDOMNode();
    return Rx.Observable.fromEvent(plusOne, 'click').map({ val: 1, id: this.props.id });
  },

  render: function() {
    return (
      <div>
        <button ref="btnMinusOne">-1</button>
        <span>{this.props.val}</span>
        <button ref="btnPlusOne">+1</button>
      </div>
    );
  }
});
```

#### Subscribe Store Data Streams

```js
var App = React.createClass({

  mixins: [
    RR.subscribe(Store, {
      data$: 'handleChange'
    })
  ],

  handleChange: function(data) {
    this.setState({ data: Object.keys(data).map(function(prop) { return data[prop];  }) });
  },

  getInitialState: function() {
    return { data: [] };
  },

  render: function() {

    var voteButtonList = this.state.data.map(function(vote) {
      return <VoteButtons id={vote.id} val={vote.val} />;
    });

    return (
      <div>
        <Creater />
        {voteButtonList}
      </div>
    );
  }
});

React.render(
  <App />,
  document.getElementById('example')
);
```
