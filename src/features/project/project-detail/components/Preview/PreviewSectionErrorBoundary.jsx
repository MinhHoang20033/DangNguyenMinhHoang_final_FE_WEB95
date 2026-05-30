import { Component } from "react";
import { Empty } from "antd";

export class PreviewSectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Preview section crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return <Empty description="Không thể hiển thị khu xem trước tệp" />;
    }

    return this.props.children;
  }
}
