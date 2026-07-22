import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:islamic_app/features/feature_placeholder/presentation/feature_placeholder_screen.dart';
import 'package:islamic_app/features/home/domain/home_feature_catalog.dart';
import 'package:islamic_app/features/home/presentation/home_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      for (final feature in HomeFeatureCatalog.features)
        GoRoute(
          path: feature.path,
          name: feature.routeName,
          builder: (context, state) => FeaturePlaceholderScreen(feature: feature),
        ),
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});
