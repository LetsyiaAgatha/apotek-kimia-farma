<?php
/**
 * State API — Satu endpoint untuk load/save seluruh state aplikasi
 * GET  /api/state.php  → Kembalikan semua data dari DB
 * POST /api/state.php  → Simpan seluruh state ke DB
 */
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ──────────────────────────────────────────────
// GET: Load seluruh state dari database
// ──────────────────────────────────────────────
if ($method === 'GET') {
    $db = getDB();

    // Products
    $products = $db->query("SELECT * FROM products ORDER BY id DESC")->fetchAll();
    foreach ($products as &$p) {
        $p['id']          = (int)$p['id'];
        $p['price']       = (int)$p['price'];
        $p['buyPrice']    = (int)($p['buy_price'] ?? 0);
        $p['stock']       = (int)$p['stock'];
        $p['status']      = $p['status'] ?? 'Tersedia';
        $p['supplier_id'] = $p['supplier_id'] ? (int)$p['supplier_id'] : null;
        // Map DB column name to JS expected key
        $p['supplierId']  = $p['supplier_id'];
        unset($p['supplier_id'], $p['created_at'], $p['buy_price']);
    }
    unset($p);

    // Consignment
    $consignment = $db->query("SELECT * FROM consignment ORDER BY id DESC")->fetchAll();
    foreach ($consignment as &$c) {
        $c['id']        = (int)$c['id'];
        $c['refId']     = (int)$c['ref_id'];
        $c['qty']       = (int)$c['qty'];
        $c['sold']      = (int)$c['sold'];
        $c['basePrice'] = (int)$c['base_price'];
        $c['sellPrice'] = (int)$c['sell_price'];
        $c['dateReceived'] = $c['date_received'];
        unset($c['ref_id'], $c['base_price'], $c['sell_price'], $c['date_received'], $c['created_at']);
    }
    unset($c);

    // Transactions
    $transactions = $db->query("SELECT * FROM transactions ORDER BY id DESC")->fetchAll();
    foreach ($transactions as &$t) {
        $t['id']           = (int)$t['id'];
        $t['total']        = (int)$t['total'];
        $t['payment']      = (int)$t['payment'];
        $t['change']       = (int)$t['change_amount'];
        $t['items']        = json_decode($t['items'] ?? '[]', true);
        unset($t['change_amount'], $t['created_at']);
    }
    unset($t);

    // Users
    $users = $db->query("SELECT * FROM users ORDER BY id ASC")->fetchAll();
    foreach ($users as &$u) {
        $u['id'] = (int)$u['id'];
        unset($u['created_at']);
    }
    unset($u);

    // Purchase Orders
    $purchaseOrders = $db->query("SELECT * FROM purchase_orders ORDER BY id DESC")->fetchAll();
    foreach ($purchaseOrders as &$po) {
        $po['id'] = (int)$po['id'];
        $po['poNumber'] = $po['po_number'];
        $po['supplierName'] = $po['supplier_name'];
        $po['picName'] = $po['pic_name'];
        $po['phoneNumber'] = $po['phone_number'];
        $po['dateCreated'] = $po['date_created'];
        unset($po['po_number'], $po['supplier_name'], $po['pic_name'], $po['phone_number'], $po['date_created'], $po['created_at']);
        
        // Fetch items
        $itemStmt = $db->prepare("SELECT * FROM purchase_order_items WHERE po_id = :po_id");
        $itemStmt->execute([':po_id' => $po['id']]);
        $items = $itemStmt->fetchAll();
        foreach ($items as &$item) {
            $item['id'] = (int)$item['id'];
            $item['poId'] = (int)$item['po_id'];
            $item['productName'] = $item['product_name'];
            $item['qty'] = (int)$item['qty'];
            $item['basePrice'] = (int)$item['base_price'];
            $item['sellPrice'] = (int)$item['sell_price'];
            unset($item['po_id'], $item['product_name'], $item['base_price'], $item['sell_price']);
        }
        unset($item);
        $po['items'] = $items;
    }
    unset($po);

    // Seen notifications (stored in app_meta)
    $metaStmt = $db->prepare("SELECT value_data FROM app_meta WHERE key_name = 'seen_notifications'");
    $metaStmt->execute();
    $metaRow = $metaStmt->fetch();
    $seenNotifications = $metaRow ? json_decode($metaRow['value_data'], true) : [];

    // Destruction History
    $destructionHistory = $db->query("SELECT * FROM destruction_history ORDER BY id DESC")->fetchAll();
    foreach ($destructionHistory as &$dh) {
        $dh['id'] = (int)$dh['id'];
        $dh['destructionDate'] = $dh['destruction_date'];
        $dh['productId'] = isset($dh['product_id']) ? (int)$dh['product_id'] : null;
        $dh['productName'] = $dh['product_name'];
        $dh['qty'] = (int)$dh['qty'];
        $dh['buyPrice'] = (int)$dh['buy_price'];
        $dh['expiry'] = $dh['expiry'];
        unset($dh['destruction_date'], $dh['product_id'], $dh['product_name'], $dh['buy_price'], $dh['created_at']);
    }
    unset($dh);

    // Procurements (Beli Putus)
    $procurements = $db->query("SELECT * FROM procurements ORDER BY id DESC")->fetchAll();
    foreach ($procurements as &$prc) {
        $prc['id'] = (int)$prc['id'];
        $prc['procurementNo'] = $prc['procurement_no'];
        $prc['purchaseDate'] = $prc['purchase_date'];
        $prc['supplierName'] = $prc['supplier_name'];
        $prc['picName'] = $prc['pic_name'];
        $prc['whatsapp'] = $prc['whatsapp'];
        unset($prc['procurement_no'], $prc['purchase_date'], $prc['supplier_name'], $prc['pic_name'], $prc['created_at']);

        // Fetch items
        $itemStmt = $db->prepare("SELECT * FROM procurement_items WHERE procurement_id = :proc_id");
        $itemStmt->execute([':proc_id' => $prc['id']]);
        $items = $itemStmt->fetchAll();
        foreach ($items as &$item) {
            $item['id'] = (int)$item['id'];
            $item['procurementId'] = (int)$item['procurement_id'];
            $item['productName'] = $item['product_name'];
            $item['category'] = $item['category'];
            $item['qty'] = (int)$item['qty'];
            $item['buyPrice'] = (int)$item['buy_price'];
            $item['sellPrice'] = (int)$item['sell_price'];
            $item['expiryDate'] = $item['expiry_date'];
            unset($item['procurement_id'], $item['product_name'], $item['buy_price'], $item['sell_price'], $item['expiry_date']);
        }
        unset($item);
        $prc['items'] = $items;
    }
    unset($prc);

    // Stock Adjustments
    $stockAdjustments = $db->query("SELECT * FROM stock_adjustments ORDER BY id DESC")->fetchAll();
    foreach ($stockAdjustments as &$sa) {
        $sa['id']            = (int)$sa['id'];
        $sa['adjustmentDate'] = $sa['adjustment_date'];
        $sa['productId']     = (int)$sa['product_id'];
        $sa['productName']   = $sa['product_name'];
        $sa['stockOld']      = (int)$sa['stock_old'];
        $sa['stockNew']      = (int)$sa['stock_new'];
        $sa['difference']    = (int)$sa['difference'];
        $sa['reason']        = $sa['reason'];
        $sa['notes']         = $sa['notes'];
        $sa['user']          = $sa['user'];
        unset($sa['adjustment_date'], $sa['product_id'], $sa['product_name'], $sa['stock_old'], $sa['stock_new'], $sa['created_at']);
    }
    unset($sa);

    jsonResponse([
        'products'           => $products,
        'consignment'        => $consignment,
        'transactions'       => $transactions,
        'users'              => $users,
        'purchaseOrders'     => $purchaseOrders,
        'destructionHistory' => $destructionHistory,
        'procurements'       => $procurements,
        'stockAdjustments'   => $stockAdjustments,
        'cart'               => [],
        'seenNotifications'  => $seenNotifications ?? [],
    ]);
}

// ──────────────────────────────────────────────
// POST: Simpan seluruh state ke database
// ──────────────────────────────────────────────
if ($method === 'POST') {
    $data = getBody();
    $db   = getDB();

    try {
        $db->beginTransaction();

        // ── Save Products ──
        if (!empty($data['products'])) {
            $db->exec("DELETE FROM products");
            $stmt = $db->prepare("
                INSERT INTO products (id, name, category, price, buy_price, stock, expiry, image, origin, supplier_id, status)
                VALUES (:id, :name, :category, :price, :buy_price, :stock, :expiry, :image, :origin, :supplier_id, :status)
            ");
            foreach ($data['products'] as $p) {
                $stmt->execute([
                    ':id'          => (int)($p['id'] ?? 0),
                    ':name'        => $p['name'] ?? '',
                    ':category'    => $p['category'] ?? 'Lainnya',
                    ':price'       => (int)($p['price'] ?? 0),
                    ':buy_price'   => (int)($p['buyPrice'] ?? 0),
                    ':stock'       => (int)($p['stock'] ?? 0),
                    ':expiry'      => $p['expiry'] ?? date('Y-m-d'),
                    ':image'       => $p['image'] ?? 'img/pills.png',
                    ':origin'      => $p['origin'] ?? 'Beli Putus',
                    ':supplier_id' => isset($p['supplierId']) ? (int)$p['supplierId'] : null,
                    ':status'      => $p['status'] ?? 'Tersedia',
                ]);
            }
        }

        // ── Save Consignment ──
        if (!empty($data['consignment'])) {
            $db->exec("DELETE FROM consignment");
            $stmt = $db->prepare("
                INSERT INTO consignment (id, ref_id, supplier, items, qty, sold, base_price, sell_price, date_received, status, pic, phone)
                VALUES (:id, :ref_id, :supplier, :items, :qty, :sold, :base_price, :sell_price, :date_received, :status, :pic, :phone)
            ");
            foreach ($data['consignment'] as $c) {
                $stmt->execute([
                    ':id'            => (int)($c['id'] ?? 0),
                    ':ref_id'        => (int)($c['refId'] ?? $c['ref_id'] ?? 0),
                    ':supplier'      => $c['supplier'] ?? '',
                    ':items'         => $c['items'] ?? '',
                    ':qty'           => (int)($c['qty'] ?? 0),
                    ':sold'          => (int)($c['sold'] ?? 0),
                    ':base_price'    => (int)($c['basePrice'] ?? 0),
                    ':sell_price'    => (int)($c['sellPrice'] ?? 0),
                    ':date_received' => $c['dateReceived'] ?? date('Y-m-d'),
                    ':status'        => $c['status'] ?? 'Aktif',
                    ':pic'           => $c['pic'] ?? null,
                    ':phone'         => $c['phone'] ?? null,
                ]);
            }
        }

        // ── Save Transactions ──
        if (!empty($data['transactions'])) {
            $db->exec("DELETE FROM transactions");
            $stmt = $db->prepare("
                INSERT INTO transactions (id, timestamp, total, payment, change_amount, items)
                VALUES (:id, :timestamp, :total, :payment, :change_amount, :items)
            ");
            foreach ($data['transactions'] as $t) {
                $stmt->execute([
                    ':id'            => (int)($t['id'] ?? 0),
                    ':timestamp'     => $t['timestamp'] ?? date('Y-m-d H:i'),
                    ':total'         => (int)($t['total'] ?? 0),
                    ':payment'       => (int)($t['payment'] ?? 0),
                    ':change_amount' => (int)($t['change'] ?? $t['change_amount'] ?? 0),
                    ':items'         => json_encode($t['items'] ?? []),
                ]);
            }
        }

        // ── Save Users ──
        if (!empty($data['users'])) {
            $db->exec("DELETE FROM users");
            $stmt = $db->prepare("
                INSERT INTO users (id, name, username, password, role, status, avatar)
                VALUES (:id, :name, :username, :password, :role, :status, :avatar)
            ");
            foreach ($data['users'] as $u) {
                $stmt->execute([
                    ':id'       => (int)($u['id'] ?? 0),
                    ':name'     => $u['name'] ?? '',
                    ':username' => $u['username'] ?? 'user' . ($u['id'] ?? rand()),
                    ':password' => $u['password'] ?? 'password123',
                    ':role'     => $u['role'] ?? 'Kasir',
                    ':status'   => $u['status'] ?? 'Aktif',
                    ':avatar'   => $u['avatar'] ?? 'US',
                ]);
            }
        }

        // ── Save Purchase Orders ──
        if (!empty($data['purchaseOrders'])) {
            $db->exec("DELETE FROM purchase_orders");
            $poStmt = $db->prepare("
                INSERT INTO purchase_orders (id, po_number, supplier_name, pic_name, phone_number, date_created, status)
                VALUES (:id, :po_number, :supplier_name, :pic_name, :phone_number, :date_created, :status)
            ");
            $itemStmt = $db->prepare("
                INSERT INTO purchase_order_items (po_id, product_name, category, qty, base_price, sell_price, expiry)
                VALUES (:po_id, :product_name, :category, :qty, :base_price, :sell_price, :expiry)
            ");
            foreach ($data['purchaseOrders'] as $po) {
                $poStmt->execute([
                    ':id'            => (int)($po['id'] ?? 0),
                    ':po_number'     => $po['poNumber'] ?? '',
                    ':supplier_name' => $po['supplierName'] ?? '',
                    ':pic_name'      => $po['picName'] ?? '',
                    ':phone_number'  => $po['phoneNumber'] ?? '',
                    ':date_created'  => $po['dateCreated'] ?? date('Y-m-d'),
                    ':status'        => $po['status'] ?? 'Draft',
                ]);
                $poId = $db->lastInsertId();
                if (empty($poId)) {
                    $poId = (int)($po['id'] ?? 0);
                }
                if (!empty($po['items'])) {
                    foreach ($po['items'] as $item) {
                        $itemStmt->execute([
                            ':po_id'        => $poId,
                            ':product_name' => $item['productName'] ?? '',
                            ':category'     => $item['category'] ?? 'Lainnya',
                            ':qty'          => (int)($item['qty'] ?? 1),
                            ':base_price'   => (int)($item['basePrice'] ?? 0),
                            ':sell_price'   => (int)($item['sellPrice'] ?? 0),
                            ':expiry'       => !empty($item['expiry']) ? $item['expiry'] : null,
                        ]);
                    }
                }
            }
        }

        // ── Save Seen Notifications ──
        if (isset($data['seenNotifications'])) {
            $val = json_encode($data['seenNotifications']);
            $db->prepare("
                INSERT INTO app_meta (key_name, value_data) VALUES ('seen_notifications', :val)
                ON DUPLICATE KEY UPDATE value_data = :val2
            ")->execute([':val' => $val, ':val2' => $val]);
        }

        // ── Save Destruction History ──
        if (isset($data['destructionHistory'])) {
            $db->exec("DELETE FROM destruction_history");
            if (!empty($data['destructionHistory'])) {
                $stmt = $db->prepare("
                    INSERT INTO destruction_history (id, destruction_date, product_id, product_name, qty, buy_price, expiry, reason, user)
                    VALUES (:id, :destruction_date, :product_id, :product_name, :qty, :buy_price, :expiry, :reason, :user)
                ");
                foreach ($data['destructionHistory'] as $dh) {
                    $stmt->execute([
                        ':id'               => (int)($dh['id'] ?? 0),
                        ':destruction_date' => $dh['destructionDate'] ?? date('Y-m-d H:i'),
                        ':product_id'       => isset($dh['productId']) ? (int)$dh['productId'] : null,
                        ':product_name'     => $dh['productName'] ?? '',
                        ':qty'              => (int)($dh['qty'] ?? 0),
                        ':buy_price'        => (int)($dh['buyPrice'] ?? 0),
                        ':expiry'           => !empty($dh['expiry']) ? $dh['expiry'] : null,
                        ':reason'           => $dh['reason'] ?? '',
                        ':user'             => $dh['user'] ?? '',
                    ]);
                }
            }
        }

        // ── Save Procurements ──
        if (isset($data['procurements'])) {
            $db->exec("DELETE FROM procurements");
            if (!empty($data['procurements'])) {
                $procStmt = $db->prepare("
                    INSERT INTO procurements (id, procurement_no, purchase_date, supplier_name, pic_name, whatsapp)
                    VALUES (:id, :procurement_no, :purchase_date, :supplier_name, :pic_name, :whatsapp)
                ");
                $itemStmt = $db->prepare("
                    INSERT INTO procurement_items (procurement_id, product_name, category, qty, buy_price, sell_price, expiry_date)
                    VALUES (:procurement_id, :product_name, :category, :qty, :buy_price, :sell_price, :expiry_date)
                ");
                foreach ($data['procurements'] as $prc) {
                    $procStmt->execute([
                        ':id'             => (int)($prc['id'] ?? 0),
                        ':procurement_no' => $prc['procurementNo'] ?? '',
                        ':purchase_date'  => $prc['purchaseDate'] ?? date('Y-m-d'),
                        ':supplier_name'  => $prc['supplierName'] ?? '',
                        ':pic_name'       => $prc['picName'] ?? '',
                        ':whatsapp'       => $prc['whatsapp'] ?? '',
                    ]);
                    $procId = $db->lastInsertId();
                    if (empty($procId)) {
                        $procId = (int)($prc['id'] ?? 0);
                    }
                    if (!empty($prc['items'])) {
                        foreach ($prc['items'] as $item) {
                            $itemStmt->execute([
                                ':procurement_id' => $procId,
                                ':product_name'   => $item['productName'] ?? '',
                                ':category'       => $item['category'] ?? 'Lainnya',
                                ':qty'            => (int)($item['qty'] ?? 0),
                                ':buy_price'      => (int)($item['buyPrice'] ?? 0),
                                ':sell_price'     => (int)($item['sellPrice'] ?? 0),
                                ':expiry_date'    => $item['expiryDate'] ?? date('Y-m-d'),
                            ]);
                        }
                    }
                }
            }
        }

        // ── Save Stock Adjustments ──
        if (isset($data['stockAdjustments'])) {
            $db->exec("DELETE FROM stock_adjustments");
            if (!empty($data['stockAdjustments'])) {
                $stmt = $db->prepare("
                    INSERT INTO stock_adjustments (id, adjustment_date, product_id, product_name, stock_old, stock_new, difference, reason, notes, user)
                    VALUES (:id, :adjustment_date, :product_id, :product_name, :stock_old, :stock_new, :difference, :reason, :notes, :user)
                ");
                foreach ($data['stockAdjustments'] as $sa) {
                    $stmt->execute([
                        ':id'              => (int)($sa['id'] ?? 0),
                        ':adjustment_date' => $sa['adjustmentDate'] ?? date('Y-m-d H:i'),
                        ':product_id'      => (int)($sa['productId'] ?? 0),
                        ':product_name'    => $sa['productName'] ?? '',
                        ':stock_old'       => (int)($sa['stockOld'] ?? 0),
                        ':stock_new'       => (int)($sa['stockNew'] ?? 0),
                        ':difference'      => (int)($sa['difference'] ?? 0),
                        ':reason'          => $sa['reason'] ?? '',
                        ':notes'           => $sa['notes'] ?? null,
                        ':user'            => $sa['user'] ?? '',
                    ]);
                }
            }
        }

        $db->commit();
        jsonResponse(['success' => true]);

    } catch (Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        jsonResponse([
            'error' => 'Database operation failed: ' . $e->getMessage()
        ], 500);
    }
}

jsonResponse(['error' => 'Method not allowed'], 405);
