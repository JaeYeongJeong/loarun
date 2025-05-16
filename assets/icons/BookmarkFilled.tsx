// assets/icons/BookmarkFilled.tsx
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const BookmarkFilled = (props: any) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1"
    />
  </Svg>
);

export default BookmarkFilled;
