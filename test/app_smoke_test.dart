import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_app/app/app.dart';

void main() {
  testWidgets('home renders and opens a feature route', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: IslamicApp()));
    await tester.pumpAndSettle();

    expect(find.text('Assalamu alaikum'), findsOneWidget);
    expect(find.text('Prayer Times'), findsOneWidget);

    await tester.tap(find.text('Prayer Times'));
    await tester.pumpAndSettle();

    expect(find.textContaining('future milestone'), findsOneWidget);
    expect(find.byType(BackButton), findsOneWidget);
  });
}
