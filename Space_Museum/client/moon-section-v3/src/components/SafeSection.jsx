import { Component } from "react";

// If a section fails to load (for example a blocked network request), show a small message
// instead of letting the error blank the whole website.
class SafeSection extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default SafeSection;
