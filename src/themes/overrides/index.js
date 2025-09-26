// third party
import { merge } from 'lodash-es';

// project imports
import Chip from './Chip.jsx';

// ===============================||  OVERRIDES - MAIN  ||=============================== //

export default function ComponentsOverrides(theme) {
  return merge(Chip(theme));
}
