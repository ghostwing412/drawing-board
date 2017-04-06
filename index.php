<?php
/**
 * Created by PhpStorm.
 * User: ghost
 * Date: 2017/4/6
 * Time: 10:27
 */
// 发送404信息
header('HTTP/1.1 418 Not Found');
header('Status:418 Not Found');
echo json_encode(array(
    'status' => 0,
    'info' => '开心了你'
));
