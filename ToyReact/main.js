import { Component, createElement, render } from "./toy-react";

class MyComponent extends Component {
  render() {
      return <div>{this.children}</div>;
  }
}

render(
  <MyComponent class="21">
    <div>23</div>
    <div>22</div>
  </MyComponent>, document.body
);
