import React, { ReactElement, Component } from 'react';
import { Presenter } from './presenter';

type ViewProps = {
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
        let viewElement = this.props.presenter.viewElement();
        return <div>{viewElement}</div>;
    }
}
