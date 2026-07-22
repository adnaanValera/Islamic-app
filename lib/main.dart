import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:islamic_app/app/app.dart';
import 'package:islamic_app/core/storage/local_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalStorage.initialize();
  runApp(const ProviderScope(child: IslamicApp()));
}
