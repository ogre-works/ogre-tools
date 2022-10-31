expect.extend({
  toMatchHtmlSnapshot(received) {
    try {
      expect(received.render()).toMatchSnapshot();
    } catch (e) {
      return {
        message: () => e.message,
        pass: false,
      };
    }

    return {
      message: () => 'expected not to match snapshot',
      pass: true,
    };
  },
});
