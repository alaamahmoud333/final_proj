import Notification from '../models/notification.js';

export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user.id,
      read: false,
    })
      .populate('sender', 'username name avatar')
      .populate('post', 'content')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch notifications', error: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: 'Could not update notification', error: err.message });
  }
};
