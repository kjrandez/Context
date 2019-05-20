import React, { ReactElement, Component } from 'react';
import { Presenter } from './presenter';

type ViewProps = {
    _key: number,
    presenter: Presenter
}

export default class View extends Component<ViewProps>
{
    componentWillMount() {
        this.props.presenter.mount(this);
    }

    componentWillUnmount() {
        this.props.presenter.unmount(this);
    }

    render(): ReactElement {
        let leaf = this.props.presenter.viewElement();
        let wrapped = this.props.presenter.wrappedViewElement(leaf);

        return <div key={this.props._key}>{wrapped}</div>;
    }
}
