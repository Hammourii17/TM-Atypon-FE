import React from 'react';
import useForm from '../hooks/useForm';

const withForm = (WrappedComponent, initialValues) => {
  return (props) => {
    const formProps = useForm(initialValues);
    return <WrappedComponent {...props} {...formProps} />;
  };
};

export default withForm;
