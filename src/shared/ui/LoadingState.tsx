import React from 'react';
import {
  LoadingState as CanonicalLoadingState,
  DataLoadingWrapper as CanonicalDataLoadingWrapper,
  LoadingStateProps,
  DataLoadingWrapperProps,
} from '../../components/feedback/LoadingState/LoadingState';

export type { LoadingStateProps, DataLoadingWrapperProps };

export const LoadingState: React.FC<LoadingStateProps> = (props) => {
  return <CanonicalLoadingState {...props} />;
};

export const DataLoadingWrapper: React.FC<DataLoadingWrapperProps> = (props) => {
  return <CanonicalDataLoadingWrapper {...props} />;
};

export default LoadingState;
