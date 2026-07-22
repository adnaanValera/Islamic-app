import 'package:hive_ce_flutter/hive_flutter.dart';

/// Application-level entry point for local persistence.
///
/// Feature repositories own their boxes and schemas. Keeping initialization
/// here prevents database concerns from leaking into widgets.
abstract final class LocalStorage {
  static Future<void> initialize() => Hive.initFlutter();
}
