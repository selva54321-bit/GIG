function getErrorMessage(error) {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') {
    return error;
  }

  if (error.message && String(error.message).trim()) {
    return error.message;
  }

  if (error.code) {
    return `Error code: ${error.code}`;
  }

  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== '{}') {
      return serialized;
    }
  } catch (serializationError) {
    // Ignore serialization issues and fall through.
  }

  try {
    return String(error);
  } catch (stringifyError) {
    return 'Unknown error';
  }
}

module.exports = {
  getErrorMessage,
};
