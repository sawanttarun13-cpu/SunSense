/**
 * =============================================================================
 * File: OfflineQueue.cpp
 * Project: SunSense Firmware
 * Layer: Storage / Offline Management
 *
 * Purpose:
 * In-memory circular buffer implementation of the offline reading queue.
 *
 * HARDWARE PENDING: Replace internal _buffer array with SPIFFS/LittleFS
 * file-backed storage to survive power cycles. The public interface
 * (begin, enqueue, getBatch, removeUploaded) will remain unchanged.
 *
 * Circular Buffer Design:
 *   _head = index of oldest item (dequeue from here)
 *   _tail = index of next free slot (enqueue here)
 *   _count = current number of items
 * =============================================================================
 */

#include "OfflineQueue.h"

void OfflineQueue::begin() {
  _head  = 0;
  _tail  = 0;
  _count = 0;

  // HARDWARE PENDING: When persistent storage is added:
  //   SPIFFS.begin();
  //   Load any previously persisted queue from flash into _buffer.

  Logger::info("QUEUE",
    "OfflineQueue initialized | capacity: " + String(QUEUE_MAX_SIZE) +
    " | storage: RAM only (SPIFFS migration pending)");
}

void OfflineQueue::enqueue(const Reading& reading) {
  if (isFull()) {
    // Queue is full — drop the oldest reading to make space.
    // This should be rare in normal operation (only if device is offline
    // for an extended period without any successful uploads).
    Logger::warn("QUEUE", "Queue full (" + String(QUEUE_MAX_SIZE) +
      ") — dropping oldest reading to make space");
    // Advance head to discard the oldest reading
    _head  = (_head + 1) % QUEUE_MAX_SIZE;
    _count--;
  }

  _buffer[_tail] = reading;
  _tail = (_tail + 1) % QUEUE_MAX_SIZE;
  _count++;

  Logger::debug("QUEUE",
    "Enqueued reading | UVI: " + String(reading.uvIndex, 1) +
    " | ts: " + String(reading.recordedAt) +
    " | queue size: " + String(_count));
}

int OfflineQueue::size() const {
  return _count;
}

bool OfflineQueue::isEmpty() const {
  return _count == 0;
}

bool OfflineQueue::isFull() const {
  return _count >= QUEUE_MAX_SIZE;
}

const Reading* OfflineQueue::peek() const {
  if (isEmpty()) return nullptr;
  return &_buffer[_head];
}

int OfflineQueue::getBatch(Reading* outBuffer, int maxCount) const {
  int fetched = 0;
  int idx     = _head;

  while (fetched < maxCount && fetched < _count) {
    outBuffer[fetched] = _buffer[idx];
    idx = (idx + 1) % QUEUE_MAX_SIZE;
    fetched++;
  }

  Logger::debug("QUEUE",
    "getBatch | fetched: " + String(fetched) +
    " / " + String(_count) + " total in queue");

  return fetched;
}

void OfflineQueue::removeUploaded(int count) {
  if (count <= 0) return;
  if (count > _count) count = _count;

  // Advance the head pointer past the acknowledged readings.
  // MUST only be called after HTTP 200 confirmation from backend.
  _head  = (_head + count) % QUEUE_MAX_SIZE;
  _count -= count;

  Logger::info("QUEUE",
    "Removed " + String(count) + " uploaded readings | remaining: " + String(_count));
}

void OfflineQueue::clear() {
  _head  = 0;
  _tail  = 0;
  _count = 0;
  Logger::warn("QUEUE", "Queue cleared — all stored readings discarded");
}

void OfflineQueue::printStatus() const {
  Logger::info("QUEUE",
    "Queue status | size: " + String(_count) +
    " / " + String(QUEUE_MAX_SIZE) +
    " | head: " + String(_head) +
    " | tail: " + String(_tail));

  if (!isEmpty()) {
    const Reading* oldest = peek();
    Logger::info("QUEUE", "Oldest reading ts: " + String(oldest->recordedAt));
  }
}
