import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import type { Practice } from '../src/types/practice';

const practice: Practice = {
  id: 'p1',
  title: 'Morning Stretch',
  description: 'A short, focused practice.',
  duration_minutes: 10,
  category: 'movement',
  completed_today: true,
  rating: 3,
};

describe('Card', () => {
  it('renders title, completed status, and current rating', async () => {
    await render(<Card practice={practice} />);

    expect(screen.getByText('Morning Stretch')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByLabelText('Rating: 3 out of 5 stars')).toBeTruthy();
  });

  it('shows Pending and no rating when not completed/unrated', async () => {
    await render(
      <Card practice={{ ...practice, completed_today: false, rating: null }} />,
    );

    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.queryByLabelText(/Rating:/)).toBeNull();
  });

  it('calls onPress with the practice id when tapped', async () => {
    const onPress = jest.fn();
    await render(<Card practice={practice} onPress={onPress} />);

    await fireEvent.press(screen.getByLabelText('Morning Stretch, completed'));
    expect(onPress).toHaveBeenCalledWith('p1');
  });
});

describe('Button', () => {
  it('fires its handler on press', async () => {
    const onPress = jest.fn();
    await render(<Button title="Go" onPress={onPress} />);

    await fireEvent.press(screen.getByText('Go'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Go" onPress={onPress} disabled />);

    await fireEvent.press(screen.getByText('Go'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
