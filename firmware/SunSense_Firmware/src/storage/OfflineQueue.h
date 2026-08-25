/**
 * =============================================================================
 * File: OfflineQueue.h
 * Project: SunSense Firmware
 * Layer: Storage / Offline Management
 *
 * Purpose:
 * Manages a FIFO queue of UV readings generated while the device is offline.
 * Ensures readings are preserved, timestamped, and uploaded to the backend
 * in chronological order upon Wi-Fi reconnection.
 *
 * Phase 5A Implementation: IN-MEMORY QUEUE (RAM-based)
 * This is a volatile queue — data is lost on power cycle or reboot.
 *
 * PERSISTENT STORAGE: HARDWARE PENDING
 * Final implementation will use SPIFFS or LittleFS to write the queue to
 * the ESP8266's on-chip flash, making it survive power cycles and reboots.
 * The migration path is designed in:
 *   - The queue interface (this header) remains unchanged.
 *   - Only OfflineQueue.cpp's internal storage backend changes.
 *   - No changes to main firmware logic will be required.
 *
 * Upload Protocol (per docs/backend/09_Offline_Synchronization.md):
 * 1. Oldest reading is sent first (chronological order).
 * 2. Readings are batched per QUEUE_BATCH_SIZE to prevent timeout.
 * 3. Readings are ONLY removed from the queue after HTTP 200 acknowledgement.
 * 4. If HTTP fails, readings are retained and retried on next sync cycle.
 * 5. Duplicate prevention: (device_id, recorded_at) unique constraint on backend.
 *    This means re-uploading is safe — backend ignores exact duplicates.
 * =============================================================================
 */

#ifndef OFFLINE_QUEUE_H
#define OFFLINE_QUEUE_H

#include <Arduino.h>
#include "../models/Reading.h"
#include "../config/firmware_config.h"
#include "../utils/Logger.h"

class OfflineQueue {
public:
  /**
   * Initializes the offline queue.
   *
   * In Phase 5A: initializes in-memory array.
   * HARDWARE PENDING: Will mount SPIFFS/LittleFS and load any persisted queue.
   *
   * Call once in setup().
   */
  void begin();

  /**
   * Adds a reading to the tail of the queue.
   * If the queue is full (at QUEUE_MAX_SIZE), the oldest reading is dropped
   * and a warning is logged.
   *
   * @param reading The Reading struct to enqueue.
   */
  void enqueue(const Reading& reading);

  /**
   * Returns the number of readings currently in the queue.
   */
  int size() const;

  /**
   * Returns true if the queue is empty.
   */
  bool isEmpty() const;

  /**
   * Returns true if the queue has reached QUEUE_MAX_SIZE.
   */
  bool isFull() const;

  /**
   * Returns a pointer to the reading at the HEAD of the queue (oldest reading).
   * Returns nullptr if the queue is empty.
   * The returned pointer is valid until the next dequeue() call.
   *
   * Used by the upload loop to prepare the next batch without removing items first.
   */
  const Reading* peek() const;

  /**
   * Returns a batch of readings from the head of the queue for upload.
   *
   * Fills the provided array with up to `maxCount` readings (oldest first).
   * Does NOT remove the readings — they must be confirmed via markUploaded()
   * after receiving HTTP 200.
   *
   * @param outBuffer   Array to fill with readings (must be >= maxCount size)
   * @param maxCount    Maximum number of readings to fetch (use QUEUE_BATCH_SIZE)
   * @return            Number of readings actually filled into outBuffer
   */
  int getBatch(Reading* outBuffer, int maxCount) const;

  /**
   * Removes the N oldest readings from the queue after successful upload.
   * MUST only be called after receiving HTTP 200 from the backend.
   *
   * Per docs/backend/09_Offline_Synchronization.md:
   * "Upon receiving HTTP 200 OK, the ESP8266 deletes those specific readings
   *  from its local queue."
   *
   * @param count Number of readings to remove (must match the batch that was sent)
   */
  void removeUploaded(int count);

  /**
   * Clears the entire queue.
   * Used during factory reset or after a full successful flush.
   */
  void clear();

  /**
   * Prints the current queue status to Serial (via Logger).
   * Shows size, capacity, oldest/newest timestamps.
   */
  void printStatus() const;

private:
  // ── In-memory circular buffer (Phase 5A) ───────────────────────────────────
  // HARDWARE PENDING: Replace internal storage with SPIFFS/LittleFS.
  // Interface remains identical — only this private section changes.
  Reading _buffer[QUEUE_MAX_SIZE];
  int     _head  = 0;   // Index of oldest reading (front of queue)
  int     _tail  = 0;   // Index of next empty slot (back of queue)
  int     _count = 0;   // Current number of readings in queue
};

#endif // OFFLINE_QUEUE_H
